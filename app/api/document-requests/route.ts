import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') ?? ''
    const status = searchParams.get('status') ?? 'all'

    let query = supabase
      .from('document_request_types')
      .select('*')
      .order('created_at', { ascending: false })

    if (search) query = query.ilike('name', `%${search}%`)
    if (status !== 'all') query = query.eq('is_active', status === 'active')

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, description, price, processing_days, is_active, requires_appointment, has_pdf_template } = body

    if (!name || !description || price === undefined || !processing_days) {
      return NextResponse.json(
        { message: 'name, description, price, and processing_days are required.' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('document_request_types')
      .insert({
        name,
        description,
        price: Number(price),
        processing_days: Number(processing_days),
        is_active: is_active ?? true,
        requires_appointment: requires_appointment ?? false,
        has_pdf_template: has_pdf_template ?? false,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(
      { message: 'Document request type created successfully.', data },
      { status: 201 }
    )
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}
