import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { page = 1, limit = 10, name, barangay, status } = await req.json()

    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = supabase
      .from('verification_requests')
      .select('*', { count: 'exact' })

    if (name) query = query.ilike('name', `*${name}*`)
    if (barangay) query = query.eq('barangay', barangay)
    if (status) query = query.eq('status', status)

    const [listResult, statsResult] = await Promise.all([
      query.order('created_at', { ascending: false }).range(from, to),
      Promise.all([
        supabase.from('verification_requests').select('*', { count: 'exact', head: true }),
        supabase.from('verification_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('verification_requests').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('verification_requests').select('*', { count: 'exact', head: true }).eq('status', 'rejected'),
      ])
    ])

    if (listResult.error) throw listResult.error

    const [total, pending, approved, rejected] = statsResult

    return NextResponse.json({
      data: listResult.data,
      count: listResult.count,
      stats: {
        total: total.count ?? 0,
        pending: pending.count ?? 0,
        approved: approved.count ?? 0,
        rejected: rejected.count ?? 0,
      }
    })
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}
