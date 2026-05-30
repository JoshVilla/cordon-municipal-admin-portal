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

    let query = supabase
      .from('document_request_types')
      .select('*')
      .order('created_at', { ascending: true })

    if (search) query = query.ilike('name', `%${search}%`)

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}
