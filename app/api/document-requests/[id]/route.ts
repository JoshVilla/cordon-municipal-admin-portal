import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export { GET } from './get'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    const { data, error } = await supabase
      .from('document_request_types')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ message: 'Document request type updated successfully.', data })
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { error } = await supabase
      .from('document_request_types')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ message: 'Document request type deleted successfully.' })
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}
