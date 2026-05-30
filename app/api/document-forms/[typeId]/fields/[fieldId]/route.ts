import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ typeId: string; fieldId: string }> }
) {
  try {
    const { typeId, fieldId } = await params
    const body = await req.json()

    const updates: Record<string, any> = {}

    if (body.field_name      !== undefined) updates.field_name      = body.field_name
    if (body.field_label     !== undefined) updates.field_label     = body.field_label
    if (body.field_type      !== undefined) updates.field_type      = body.field_type
    if (body.placeholder     !== undefined) updates.placeholder     = body.placeholder || null
    if (body.help_text       !== undefined) updates.help_text       = body.help_text || null
    if (body.is_required     !== undefined) updates.is_required     = body.is_required
    if (body.select_options  !== undefined) updates.select_options  = body.select_options?.length ? body.select_options : null
    if (body.default_value   !== undefined) updates.default_value   = body.default_value || null
    if (body.min_length      !== undefined) updates.min_length      = body.min_length != null ? Number(body.min_length) : null
    if (body.max_length      !== undefined) updates.max_length      = body.max_length != null ? Number(body.max_length) : null

    const { data, error } = await supabase
      .from('municipal_document_fields')
      .update(updates)
      .eq('id', fieldId)
      .eq('document_type_id', typeId)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ data, message: 'Field updated successfully.' })
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ typeId: string; fieldId: string }> }
) {
  try {
    const { typeId, fieldId } = await params

    const { error } = await supabase
      .from('municipal_document_fields')
      .delete()
      .eq('id', fieldId)
      .eq('document_type_id', typeId)

    if (error) throw error
    return NextResponse.json({ message: 'Field deleted successfully.' })
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}
