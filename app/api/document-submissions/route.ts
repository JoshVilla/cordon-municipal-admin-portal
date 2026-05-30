import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { page = 1, limit = 10, reference, status, payment_status, document_type_id } = await req.json()

    // --- list query ---
    let query = supabase
      .from('municipal_document_submissions')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (reference)        query = query.ilike('reference_number', `%${reference}%`)
    if (status && status !== 'all')                 query = query.eq('status', status)
    if (payment_status && payment_status !== 'all') query = query.eq('payment_status', payment_status)
    if (document_type_id && document_type_id !== 'all') query = query.eq('document_type_id', document_type_id)

    const { data, count, error } = await query.range((page - 1) * limit, page * limit - 1)
    if (error) throw error

    // --- stats ---
    const { data: statsData, error: statsError } = await supabase
      .from('municipal_document_submissions')
      .select('status, payment_status')

    if (statsError) throw statsError

    const stats = {
      total:      statsData.length,
      pending:    statsData.filter(r => r.status === 'pending').length,
      reviewing:  statsData.filter(r => r.status === 'reviewing').length,
      approved:   statsData.filter(r => r.status === 'approved').length,
      rejected:   statsData.filter(r => r.status === 'rejected').length,
      completed:  statsData.filter(r => r.status === 'completed').length,
      unpaid:     statsData.filter(r => r.payment_status === 'unpaid').length,
      paid:       statsData.filter(r => r.payment_status === 'paid').length,
    }

    // --- document type names lookup ---
    const typeIds = [...new Set((data ?? []).map((r: any) => r.document_type_id).filter(Boolean))]
    let typeMap: Record<string, string> = {}

    if (typeIds.length > 0) {
      const { data: types } = await supabase
        .from('document_request_types')
        .select('id, name')
        .in('id', typeIds)

      typeMap = Object.fromEntries((types ?? []).map((t: any) => [t.id, t.name]))
    }

    const enriched = (data ?? []).map((row: any) => ({
      ...row,
      document_type_name: typeMap[row.document_type_id] ?? '—',
    }))

    return NextResponse.json({ data: enriched, count, stats })
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}
