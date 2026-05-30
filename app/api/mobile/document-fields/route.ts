import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 })
}

export async function POST(req: NextRequest) {
  const { docTypeId } = await req.json()

  if (!docTypeId) {
    return NextResponse.json(
      { message: 'Document type ID is required' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('municipal_document_fields')
    .select('*')
    .eq('document_type_id', docTypeId)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('[document-fields]', error.message)
    return NextResponse.json(
      { message: 'Failed to load form fields' },
      { status: 500 }
    )
  }

  return NextResponse.json({ data: data ?? [] })
}