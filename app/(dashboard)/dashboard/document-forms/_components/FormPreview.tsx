"use client"

import { DocumentType, DocumentField, FieldType } from '../_types'
import { Smartphone, ChevronLeft, MoreVertical, FileText } from 'lucide-react'

interface Props {
  documentType: DocumentType
  fields: DocumentField[]
}

export default function FormPreview({ documentType, fields }: Props) {
  return (
    <div className="flex-1 bg-card border border-border rounded-lg p-6 flex items-start justify-center overflow-y-auto">
      <div className="flex flex-col items-center gap-4">

        {/* Label */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Smartphone size={14} />
          <span>Flutter App Preview — iServe Mobile</span>
        </div>

        {/* Phone shell */}
        <div
          className="relative bg-gray-900 rounded-[2.5rem] shadow-2xl"
          style={{ width: 295, padding: '10px' }}
        >
          {/* Top notch */}
          <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-16 h-5 bg-gray-900 rounded-full z-10 pointer-events-none" />

          {/* Screen */}
          <div
            className="bg-white rounded-[2rem] overflow-hidden flex flex-col"
            style={{ minHeight: 570 }}
          >
            {/* Status bar */}
            <div className="bg-white px-5 pt-8 pb-1.5 flex items-center justify-between">
              <span className="text-[8px] font-bold text-gray-900 select-none">9:41</span>
              <div className="flex items-center gap-1">
                <div className="flex gap-0.5 items-end h-2.5">
                  {[2, 3, 4, 4].map((h, i) => (
                    <div key={i} className="w-0.5 bg-gray-800 rounded-sm" style={{ height: h * 2.5 }} />
                  ))}
                </div>
              </div>
            </div>

            {/* App bar */}
            <div className="bg-white px-3 pt-1 pb-2.5 flex items-center gap-2 border-b border-gray-100 shadow-sm">
              <ChevronLeft size={17} className="text-blue-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-bold text-gray-900 leading-tight truncate">
                  {documentType.name}
                </p>
                <p className="text-[9px] text-gray-400 truncate">
                  Fill in all required information
                </p>
              </div>
              <MoreVertical size={14} className="text-gray-400 shrink-0" />
            </div>

            {/* Price + days chips */}
            <div className="px-3 pt-2.5 pb-1 flex items-center gap-1.5">
              <span className="text-[9px] bg-blue-50 text-blue-600 border border-blue-100 rounded-full px-2 py-0.5 font-medium">
                ₱{documentType.price.toFixed(2)}
              </span>
              <span className="text-[9px] bg-green-50 text-green-600 border border-green-100 rounded-full px-2 py-0.5 font-medium">
                {documentType.processing_days}d processing
              </span>
            </div>

            {/* Form fields */}
            <div className="flex-1 px-3 pb-4 overflow-y-auto">
              {fields.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-300">
                  <FileText size={28} className="mb-2" />
                  <p className="text-[10px] text-center">No fields configured yet.</p>
                </div>
              ) : (
                <div className="space-y-3 pt-1">
                  <p className="text-[9px] text-gray-400">
                    Fields marked <span className="text-red-400 font-bold">*</span> are required.
                  </p>
                  {fields.map((field) => (
                    <PreviewField key={field.id} field={field} />
                  ))}

                  {/* Submit button */}
                  <div className="pt-2">
                    <div className="w-full h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                      <span className="text-white text-[11px] font-bold tracking-wide">
                        SUBMIT REQUEST
                      </span>
                    </div>
                    <p className="text-[8px] text-gray-400 text-center mt-1.5">
                      You will receive a reference number after submission.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Home indicator */}
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 w-20 h-1 bg-gray-600 rounded-full" />
        </div>

        <p className="text-[11px] text-muted-foreground text-center max-w-[295px] leading-relaxed">
          Live preview of how the form appears in the{' '}
          <strong className="font-medium text-foreground">iServe</strong> mobile app.
          Fields render in configured order.
        </p>
      </div>
    </div>
  )
}

/* ── Per-field preview renderer ───────────────────────────────── */

function PreviewField({ field }: { field: DocumentField }) {
  const label = (
    <p className="text-[10px] font-medium text-gray-600 mb-1">
      {field.field_label}
      {field.is_required && <span className="text-red-400 ml-0.5">*</span>}
    </p>
  )
  const hint = field.help_text ? (
    <p className="text-[9px] text-gray-400 mt-0.5 leading-tight">{field.help_text}</p>
  ) : null

  switch (field.field_type as FieldType) {
    case 'text':
    case 'number':
    case 'email':
    case 'phone':
      return (
        <div>
          {label}
          <div className="w-full border border-gray-200 rounded-lg h-8 px-2.5 bg-gray-50 flex items-center">
            <span className="text-[10px] text-gray-400 truncate">
              {field.placeholder || `Enter ${field.field_label.toLowerCase()}…`}
            </span>
          </div>
          {hint}
        </div>
      )

    case 'textarea':
      return (
        <div>
          {label}
          <div className="w-full border border-gray-200 rounded-lg h-14 px-2.5 py-2 bg-gray-50 flex items-start">
            <span className="text-[10px] text-gray-400">
              {field.placeholder || `Enter ${field.field_label.toLowerCase()}…`}
            </span>
          </div>
          {hint}
        </div>
      )

    case 'date':
      return (
        <div>
          {label}
          <div className="w-full border border-gray-200 rounded-lg h-8 px-2.5 bg-gray-50 flex items-center justify-between">
            <span className="text-[10px] text-gray-400">
              {field.placeholder || 'DD / MM / YYYY'}
            </span>
            <span className="text-gray-300 text-[11px]">📅</span>
          </div>
          {hint}
        </div>
      )

    case 'select':
      return (
        <div>
          {label}
          <div className="w-full border border-gray-200 rounded-lg h-8 px-2.5 bg-gray-50 flex items-center justify-between">
            <span className="text-[10px] text-gray-400">
              {field.select_options?.[0] || field.placeholder || `Select ${field.field_label.toLowerCase()}…`}
            </span>
            <span className="text-gray-300 text-[9px]">▼</span>
          </div>
          {hint}
        </div>
      )

    case 'radio':
      return (
        <div>
          {label}
          <div className="space-y-1.5">
            {(field.select_options?.slice(0, 4) ?? ['Option 1', 'Option 2']).map((opt: string) => (
              <div key={opt} className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300 flex items-center justify-center shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-transparent" />
                </div>
                <span className="text-[10px] text-gray-600">{opt}</span>
              </div>
            ))}
            {(field.select_options?.length ?? 0) > 4 && (
              <p className="text-[9px] text-gray-400 ml-5">
                +{(field.select_options?.length ?? 0) - 4} more…
              </p>
            )}
          </div>
          {hint}
        </div>
      )

    case 'checkbox':
      return (
        <div className="flex items-start gap-2">
          <div className="w-3.5 h-3.5 border-2 border-gray-300 rounded mt-0.5 shrink-0" />
          <div>
            <p className="text-[10px] text-gray-700">
              {field.field_label}
              {field.is_required && <span className="text-red-400 ml-0.5">*</span>}
            </p>
            {hint}
          </div>
        </div>
      )

    case 'file':
      return (
        <div>
          {label}
          <div className="w-full border-2 border-dashed border-gray-200 rounded-lg h-14 flex flex-col items-center justify-center bg-gray-50/50">
            <span className="text-[14px]">📎</span>
            <span className="text-[9px] text-gray-400 mt-0.5">
              {field.placeholder || 'Tap to upload file'}
            </span>
          </div>
          {hint}
        </div>
      )

    default:
      return null
  }
}
