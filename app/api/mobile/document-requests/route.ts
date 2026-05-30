import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 })
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('document_request_types')
      .select('id, name, description, price, processing_days, requires_appointment, has_pdf_template')
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (error) throw error

    return NextResponse.json({ data }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}
