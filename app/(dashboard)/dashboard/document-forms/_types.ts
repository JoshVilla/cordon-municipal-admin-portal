export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'email'
  | 'phone'
  | 'date'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'file'

export interface FieldTypeOption {
  value: FieldType
  label: string
}

export const FIELD_TYPES: FieldTypeOption[] = [
  { value: 'text',     label: 'Text' },
  { value: 'textarea', label: 'Long Text' },
  { value: 'number',   label: 'Number' },
  { value: 'email',    label: 'Email' },
  { value: 'phone',    label: 'Phone' },
  { value: 'date',     label: 'Date' },
  { value: 'select',   label: 'Dropdown' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'radio',    label: 'Radio Group' },
  { value: 'file',     label: 'File Upload' },
]

export interface DocumentType {
  id: string
  name: string
  description: string | null
  price: number
  processing_days: number
  is_active: boolean
  requires_appointment: boolean
  has_pdf_template: boolean
  created_at: string
  updated_at: string
}

export interface DocumentField {
  id: string
  document_type_id: string
  field_name: string
  field_label: string
  field_type: FieldType
  placeholder: string | null
  help_text: string | null
  is_required: boolean
  select_options: string[] | null
  default_value: string | null
  min_length: number | null
  max_length: number | null
  sort_order: number
  created_at: string
}

export interface FieldFormValues {
  field_name: string
  field_label: string
  field_type: FieldType
  placeholder: string
  help_text: string
  is_required: boolean
  select_options_raw: string[]
  default_value: string
  min_length: string
  max_length: string
}
