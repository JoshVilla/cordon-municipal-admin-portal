"use client"

import { useState, useEffect, useCallback } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { showToast } from '@/lib/utils'
import { DocumentType, DocumentField, FieldFormValues } from '../_types'
import FieldCard from './FieldCard'
import FieldFormSheet from './FieldFormSheet'
import DeleteConfirmation from '@/components/deleteConfirmation'
import { Plus, Layers, ArrowUpDown, FileText } from 'lucide-react'

interface Props {
  documentType: DocumentType
  fields: DocumentField[]
  onFieldsChange: (fields: DocumentField[]) => void
}

export default function FieldBuilder({ documentType, fields, onFieldsChange }: Props) {
  const [loading, setLoading] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingField, setEditingField] = useState<DocumentField | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; field: DocumentField | null }>({
    open: false,
    field: null,
  })

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const fetchFields = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/document-forms/${documentType.id}/fields`)
      if (!res.ok) throw new Error('Failed to fetch fields.')
      const { data } = await res.json()
      onFieldsChange(data ?? [])
    } catch {
      showToast.error('Failed to load fields.')
    } finally {
      setLoading(false)
    }
  }, [documentType.id, onFieldsChange])

  useEffect(() => {
    fetchFields()
  }, [fetchFields])

  /* ── Drag & Drop ──────────────────────────────────────────── */

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = fields.findIndex((f) => f.id === active.id)
    const newIndex = fields.findIndex((f) => f.id === over.id)
    const reordered = arrayMove(fields, oldIndex, newIndex).map((f, i) => ({
      ...f,
      sort_order: i,
    }))

    onFieldsChange(reordered)

    try {
      const res = await fetch(`/api/document-forms/${documentType.id}/fields/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: reordered.map(({ id, sort_order }) => ({ id, sort_order })),
        }),
      })
      if (!res.ok) throw new Error('Failed to persist order.')
    } catch {
      showToast.error('Failed to save new order.')
      fetchFields()
    }
  }

  /* ── Save (create / update) ───────────────────────────────── */

  const handleSaveField = async (values: FieldFormValues) => {
    setSaving(true)
    try {
      const payload = {
        field_name:     values.field_name,
        field_label:    values.field_label,
        field_type:     values.field_type,
        placeholder:    values.placeholder || null,
        help_text:      values.help_text || null,
        is_required:    values.is_required,
        select_options: values.select_options_raw.length ? values.select_options_raw : null,
        default_value:  values.default_value || null,
        min_length:     values.min_length ? Number(values.min_length) : null,
        max_length:     values.max_length ? Number(values.max_length) : null,
      }

      const url = editingField
        ? `/api/document-forms/${documentType.id}/fields/${editingField.id}`
        : `/api/document-forms/${documentType.id}/fields`

      const res = await fetch(url, {
        method:  editingField ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.message)

      showToast.success(result.message)
      setSheetOpen(false)
      setEditingField(null)
      fetchFields()
    } catch (err: any) {
      showToast.error(err.message ?? 'Failed to save field.')
    } finally {
      setSaving(false)
    }
  }

  /* ── Toggle required inline ───────────────────────────────── */

  const handleToggleRequired = async (field: DocumentField) => {
    const next = !field.is_required
    onFieldsChange(fields.map((f) => (f.id === field.id ? { ...f, is_required: next } : f)))

    try {
      const res = await fetch(
        `/api/document-forms/${documentType.id}/fields/${field.id}`,
        {
          method:  'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ is_required: next }),
        }
      )
      const result = await res.json()
      if (!res.ok) throw new Error(result.message)
    } catch (err: any) {
      onFieldsChange(
        fields.map((f) => (f.id === field.id ? { ...f, is_required: field.is_required } : f))
      )
      showToast.error(err.message ?? 'Failed to update field.')
    }
  }

  /* ── Delete ───────────────────────────────────────────────── */

  const handleDeleteField = async (field: DocumentField) => {
    try {
      const res = await fetch(
        `/api/document-forms/${documentType.id}/fields/${field.id}`,
        { method: 'DELETE' }
      )
      const result = await res.json()
      if (!res.ok) throw new Error(result.message)

      showToast.success(result.message)
      onFieldsChange(fields.filter((f) => f.id !== field.id))
      setDeleteDialog({ open: false, field: null })
    } catch (err: any) {
      showToast.error(err.message ?? 'Failed to delete field.')
    }
  }

  /* ── Render ───────────────────────────────────────────────── */

  return (
    <div className="flex-1 flex flex-col bg-card border border-border rounded-lg overflow-hidden min-h-0">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <FileText size={15} className="text-primary shrink-0" />
            <h2 className="text-sm font-semibold truncate">{documentType.name}</h2>
            {!documentType.is_active && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0">
                Inactive
              </Badge>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5 ml-5 flex items-center gap-1.5">
            <span>
              {loading ? '…' : fields.length} field{fields.length !== 1 ? 's' : ''}
            </span>
            {fields.length > 1 && !loading && (
              <>
                <span className="text-border">·</span>
                <ArrowUpDown size={10} />
                <span>Drag to reorder</span>
              </>
            )}
          </p>
        </div>

        <Button
          size="sm"
          className="gap-1.5 h-8 shrink-0"
          onClick={() => {
            setEditingField(null)
            setSheetOpen(true)
          }}
        >
          <Plus size={13} /> Add Field
        </Button>
      </div>

      {/* Field list */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        ) : fields.length === 0 ? (
          <div className="h-full min-h-[280px] flex flex-col items-center justify-center text-muted-foreground">
            <Layers size={40} className="mb-3 opacity-15" />
            <p className="text-sm font-medium">No fields configured</p>
            <p className="text-xs mt-1 text-center max-w-[260px]">
              Add fields to define what the mobile user fills in when requesting{' '}
              <span className="font-medium text-foreground">{documentType.name}</span>.
            </p>
            <Button
              size="sm"
              variant="outline"
              className="mt-4 gap-1.5"
              onClick={() => {
                setEditingField(null)
                setSheetOpen(true)
              }}
            >
              <Plus size={13} /> Add First Field
            </Button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={fields.map((f) => f.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {fields.map((field) => (
                  <FieldCard
                    key={field.id}
                    field={field}
                    onEdit={(f) => {
                      setEditingField(f)
                      setSheetOpen(true)
                    }}
                    onDelete={(f) => setDeleteDialog({ open: true, field: f })}
                    onToggleRequired={handleToggleRequired}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Field form sheet */}
      <FieldFormSheet
        open={sheetOpen}
        field={editingField}
        onClose={() => {
          setSheetOpen(false)
          setEditingField(null)
        }}
        onSave={handleSaveField}
        saving={saving}
      />

      {/* Delete confirmation */}
      <DeleteConfirmation
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, field: null })}
        onConfirm={handleDeleteField}
        data={deleteDialog.field}
      />
    </div>
  )
}
