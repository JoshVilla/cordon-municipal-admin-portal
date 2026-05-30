import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 })
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    let query = supabase
      .from('announcements')
      .select('*')
      .eq('status', 'published')
      .eq('visibility', true)
      .in('target_audience', ['all', 'registered'])
      .order('created_at', { ascending: false })

    if (category) query = query.eq('category', category)
    if (search) query = query.ilike('title', `%${search}%`)

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ data }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}
