import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ typeId: string }> }
) {
  try {
    const { typeId } = await params

    const { data, error } = await supabase
      .from('municipal_document_fields')
      .select('*')
      .eq('document_type_id', typeId)
      .order('sort_order', { ascending: true })

    if (error) throw error
    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ typeId: string }> }
) {
  try {
    const { typeId } = await params
    const body = await req.json()

    const {
      field_name,
      field_label,
      field_type,
      placeholder,
      help_text,
      is_required,
      select_options,
      default_value,
      min_length,
      max_length,
    } = body

    if (!field_name || !field_label || !field_type) {
      return NextResponse.json(
        { message: 'field_name, field_label, and field_type are required.' },
        { status: 400 }
      )
    }

    const { data: existing } = await supabase
      .from('municipal_document_fields')
      .select('sort_order')
      .eq('document_type_id', typeId)
      .order('sort_order', { ascending: false })
      .limit(1)

    const nextOrder = (existing?.[0]?.sort_order ?? -1) + 1

    const { data, error } = await supabase
      .from('municipal_document_fields')
      .insert({
        document_type_id: typeId,
        field_name,
        field_label,
        field_type,
        placeholder: placeholder || null,
        help_text: help_text || null,
        is_required: is_required ?? false,
        select_options: select_options?.length ? select_options : null,
        default_value: default_value || null,
        min_length: min_length != null ? Number(min_length) : null,
        max_length: max_length != null ? Number(max_length) : null,
        sort_order: nextOrder,
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ data, message: 'Field created successfully.' }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}
