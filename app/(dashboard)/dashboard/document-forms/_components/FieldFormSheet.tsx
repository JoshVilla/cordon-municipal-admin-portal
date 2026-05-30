"use client"

import { useState, useEffect } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DocumentField, FieldFormValues, FieldType, FIELD_TYPES } from '../_types'
import { Plus, X, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  open: boolean
  field: DocumentField | null
  onClose: () => void
  onSave: (values: FieldFormValues) => Promise<void>
  saving: boolean
}

const EMPTY: FieldFormValues = {
  field_name: '',
  field_label: '',
  field_type: 'text',
  placeholder: '',
  help_text: '',
  is_required: false,
  select_options_raw: [],
  default_value: '',
  min_length: '',
  max_length: '',
}

const toSnakeCase = (label: string) =>
  label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_')

export default function FieldFormSheet({ open, field, onClose, onSave, saving }: Props) {
  const [form, setForm] = useState<FieldFormValues>(EMPTY)
  const [newOption, setNewOption] = useState('')
  const [autoSlug, setAutoSlug] = useState(true)

  useEffect(() => {
    if (!open) return
    if (field) {
      setForm({
        field_name:        field.field_name,
        field_label:       field.field_label,
        field_type:        field.field_type,
        placeholder:       field.placeholder ?? '',
        help_text:         field.help_text ?? '',
        is_required:       field.is_required,
        select_options_raw: field.select_options ?? [],
        default_value:     field.default_value ?? '',
        min_length:        field.min_length?.toString() ?? '',
        max_length:        field.max_length?.toString() ?? '',
      })
      setAutoSlug(false)
    } else {
      setForm(EMPTY)
      setAutoSlug(true)
    }
    setNewOption('')
  }, [field, open])

  const set = <K extends keyof FieldFormValues>(k: K, v: FieldFormValues[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const handleLabelChange = (label: string) => {
    set('field_label', label)
    if (autoSlug) set('field_name', toSnakeCase(label))
  }

  const handleFieldNameChange = (name: string) => {
    set('field_name', name)
    setAutoSlug(false)
  }

  const addOption = () => {
    const trimmed = newOption.trim()
    if (!trimmed) return
    const current = form.select_options_raw
    if (current.includes(trimmed)) return
    set('select_options_raw', [...current, trimmed])
    setNewOption('')
  }

  const removeOption = (opt: string) =>
    set('select_options_raw', form.select_options_raw.filter((o) => o !== opt))

  const handleSubmit = async () => {
    await onSave(form)
  }

  const needsOptions = ['select', 'radio'].includes(form.field_type)
  const needsLengths = ['text', 'textarea'].includes(form.field_type)
  const isValid = form.field_label.trim() && form.field_name.trim()

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-[420px] sm:w-[480px] flex flex-col gap-0 p-0">
        <SheetHeader className="px-5 py-4 border-b border-border">
          <SheetTitle className="text-base">
            {field ? 'Edit Field' : 'Add New Field'}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

          {/* ── Basic Config ─────────────────────────────── */}
          <Section title="Basic Configuration">
            <Field label="Field Label" required>
              <Input
                value={form.field_label}
                onChange={(e) => handleLabelChange(e.target.value)}
                placeholder="e.g. Full Name"
                className="h-9 text-sm"
              />
            </Field>

            <Field
              label="Field Name"
              hint="Used as JSON key in form submissions"
            >
              <div className="relative">
                <Input
                  value={form.field_name}
                  onChange={(e) => handleFieldNameChange(e.target.value)}
                  placeholder="e.g. full_name"
                  className="h-9 text-sm font-mono pr-16"
                />
                {autoSlug && (
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    auto
                  </span>
                )}
              </div>
            </Field>

            <Field label="Field Type" required>
              <Select
                value={form.field_type}
                onValueChange={(v) => set('field_type', v as FieldType)}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FIELD_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value} className="text-sm">
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </Section>

          {/* ── Dropdown / Radio Options ──────────────────── */}
          {needsOptions && (
            <>
              <Separator />
              <Section title="Options">
                <div className="flex gap-2">
                  <Input
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addOption())}
                    placeholder="Type an option and press Enter…"
                    className="h-8 text-sm flex-1"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 shrink-0"
                    onClick={addOption}
                  >
                    <Plus size={13} />
                  </Button>
                </div>

                {form.select_options_raw.length > 0 ? (
                  <div className="space-y-1.5 mt-1">
                    {form.select_options_raw.map((opt, i) => (
                      <div
                        key={opt}
                        className="flex items-center justify-between bg-accent rounded-md px-2.5 py-1.5"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground font-mono w-4">
                            {i + 1}.
                          </span>
                          <span className="text-xs">{opt}</span>
                        </div>
                        <button
                          onClick={() => removeOption(opt)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-muted-foreground italic">
                    No options added yet.
                  </p>
                )}
              </Section>
            </>
          )}

          {/* ── UX Config ────────────────────────────────── */}
          <Separator />
          <Section title="Display & UX">
            <Field label="Placeholder">
              <Input
                value={form.placeholder}
                onChange={(e) => set('placeholder', e.target.value)}
                placeholder="Hint text inside the field…"
                className="h-9 text-sm"
              />
            </Field>

            <Field label="Help Text" hint="Shown below the field as guidance">
              <Textarea
                value={form.help_text}
                onChange={(e) => set('help_text', e.target.value)}
                placeholder="Additional instructions for the user…"
                className="text-sm resize-none"
                rows={2}
              />
            </Field>

            <Field label="Default Value">
              <Input
                value={form.default_value}
                onChange={(e) => set('default_value', e.target.value)}
                placeholder="Pre-filled value…"
                className="h-9 text-sm"
              />
            </Field>
          </Section>

          {/* ── Length Constraints ───────────────────────── */}
          {needsLengths && (
            <>
              <Separator />
              <Section title="Length Constraints">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Min Length">
                    <Input
                      type="number"
                      min={0}
                      value={form.min_length}
                      onChange={(e) => set('min_length', e.target.value)}
                      placeholder="0"
                      className="h-9 text-sm"
                    />
                  </Field>
                  <Field label="Max Length">
                    <Input
                      type="number"
                      min={0}
                      value={form.max_length}
                      onChange={(e) => set('max_length', e.target.value)}
                      placeholder="No limit"
                      className="h-9 text-sm"
                    />
                  </Field>
                </div>
              </Section>
            </>
          )}

          {/* ── Required toggle ───────────────────────────── */}
          <Separator />
          <div
            className={cn(
              'flex items-center justify-between p-3.5 rounded-lg border transition-colors',
              form.is_required
                ? 'bg-destructive/5 border-destructive/20'
                : 'bg-accent border-transparent'
            )}
          >
            <div>
              <p className="text-sm font-medium">Required Field</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Users must complete this field before submitting.
              </p>
            </div>
            <Switch
              checked={form.is_required}
              onCheckedChange={(v) => set('is_required', v)}
            />
          </div>

          {/* Validation summary */}
          {!isValid && (
            <div className="flex items-start gap-2 text-[11px] text-amber-600 bg-amber-50 dark:bg-amber-950 dark:text-amber-400 border border-amber-200 dark:border-amber-800 rounded-md p-2.5">
              <Info size={13} className="mt-0.5 shrink-0" />
              <span>Field Label and Field Name are required to save.</span>
            </div>
          )}
        </div>

        <SheetFooter className="px-5 py-4 border-t border-border gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1 sm:flex-none">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saving || !isValid}
            className="flex-1 sm:flex-none"
          >
            {saving ? 'Saving…' : field ? 'Update Field' : 'Add Field'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

/* ── Small helpers ─────────────────────────────────────────────── */

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        {title}
      </p>
      {children}
    </div>
  )
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string
  required?: boolean
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
        {hint && (
          <span className="ml-1.5 font-normal text-muted-foreground">{hint}</span>
        )}
      </Label>
      {children}
    </div>
  )
}
