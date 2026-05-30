"use client"

import { useState, useEffect } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { showToast } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import type { DocumentRequestType } from './DocumentRequestsTab'

interface Props {
  open: boolean
  doc: DocumentRequestType | null
  onClose: () => void
  onSave: (doc: DocumentRequestType, isNew: boolean) => void
}

const defaultForm = {
  name: '',
  description: '',
  price: '',
  processing_days: '',
  is_active: true,
  requires_appointment: false,
  has_pdf_template: false,
}

export default function DocumentRequestModal({ open, doc, onClose, onSave }: Props) {
  const [form, setForm] = useState(defaultForm)
  const [saving, setSaving] = useState(false)
  const isEdit = !!doc

  useEffect(() => {
    if (open) {
      setForm(
        doc
          ? {
              name: doc.name,
              description: doc.description,
              price: String(doc.price),
              processing_days: String(doc.processing_days),
              is_active: doc.is_active,
              requires_appointment: doc.requires_appointment,
              has_pdf_template: doc.has_pdf_template,
            }
          : defaultForm
      )
    }
  }, [doc, open])

  const setField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const validate = (): string | null => {
    if (!form.name.trim()) return 'Document name is required.'
    if (!form.description.trim()) return 'Description is required.'
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) < 0)
      return 'A valid price is required.'
    if (!form.processing_days || isNaN(Number(form.processing_days)) || Number(form.processing_days) < 1)
      return 'Processing days must be at least 1.'
    return null
  }

  const handleSubmit = async () => {
    const err = validate()
    if (err) { showToast.error(err); return }

    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        processing_days: Number(form.processing_days),
        is_active: form.is_active,
        requires_appointment: form.requires_appointment,
        has_pdf_template: form.has_pdf_template,
      }

      const res = await fetch(
        isEdit ? `/api/document-requests/${doc!.id}` : '/api/document-requests',
        {
          method: isEdit ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      )
      const result = await res.json()
      if (!res.ok) throw new Error(result.message)

      showToast.success(result.message)
      onSave(result.data, !isEdit)
      onClose()
    } catch (err: any) {
      showToast.error(err.message ?? 'Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit' : 'Add'} Document Request Type</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="space-y-2">
            <Label htmlFor="doc-name">
              Document Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="doc-name"
              placeholder="e.g. Barangay Clearance"
              value={form.name}
              onChange={(e) => setField('name', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="doc-desc">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="doc-desc"
              placeholder="Brief description of this document..."
              rows={3}
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="doc-price">
                Price (₱) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="doc-price"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.price}
                onChange={(e) => setField('price', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="doc-days">
                Processing Days <span className="text-destructive">*</span>
              </Label>
              <Input
                id="doc-days"
                type="number"
                min="1"
                placeholder="e.g. 3"
                value={form.processing_days}
                onChange={(e) => setField('processing_days', e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-lg border border-border p-4 space-y-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Options
            </p>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Active</p>
                <p className="text-xs text-muted-foreground">Visible to citizens in the mobile app</p>
              </div>
              <Switch
                checked={form.is_active}
                onCheckedChange={(v) => setField('is_active', v)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Requires Appointment</p>
                <p className="text-xs text-muted-foreground">Citizens must book an appointment</p>
              </div>
              <Switch
                checked={form.requires_appointment}
                onCheckedChange={(v) => setField('requires_appointment', v)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Downloadable PDF Template</p>
                <p className="text-xs text-muted-foreground">Provide a downloadable form template</p>
              </div>
              <Switch
                checked={form.has_pdf_template}
                onCheckedChange={(v) => setField('has_pdf_template', v)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving} className="gap-2">
            {saving && <Loader2 size={14} className="animate-spin" />}
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Document Type'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
