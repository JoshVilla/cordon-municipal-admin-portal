import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data, error } = await supabase
      .from('municipal_document_submissions')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    // enrich with document type name
    let documentTypeName = '—'
    if (data.document_type_id) {
      const { data: type } = await supabase
        .from('document_request_types')
        .select('name')
        .eq('id', data.document_type_id)
        .single()
      if (type) documentTypeName = type.name
    }

    return NextResponse.json({ data: { ...data, document_type_name: documentTypeName } })
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    const allowed = ['status', 'payment_status', 'admin_notes']
    const updates: Record<string, any> = { updated_at: new Date().toISOString() }

    for (const key of allowed) {
      if (body[key] !== undefined) updates[key] = body[key]
    }

    const validStatuses = ['pending', 'reviewing', 'approved', 'rejected', 'completed']
    if (updates.status && !validStatuses.includes(updates.status)) {
      return NextResponse.json({ message: 'Invalid status.' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('municipal_document_submissions')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data, message: 'Submission updated successfully.' })
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}
