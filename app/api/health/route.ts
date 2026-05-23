// app/api/health/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const staffId = searchParams.get('id')

    // 1. Check DB
    const { error: dbError } = await supabaseAdmin
      .from('staffs')
      .select('id')
      .limit(1)

    if (dbError) throw dbError

    // 2. Lift expired suspensions
    const { data: lifted, error: liftError } = await supabaseAdmin
      .rpc('lift_expired_suspensions')

    if (liftError) throw liftError

    // 3. Check current account status
    let account = null
    if (staffId) {
      const { data, error: accountError } = await supabaseAdmin
        .from('staffs')
        .select('id, name, employee_id, status, suspend_duration, suspended_at')
        .eq('id', staffId)
        .single()

      if (accountError) throw accountError

      account = {
        id: data.id,
        name: data.name,
        employee_id: data.employee_id,
        status: data.status,
        suspend_duration: data.suspend_duration,
        suspended_at: data.suspended_at,
        lifts_on: data.suspended_at && data.suspend_duration
          ? new Date(
              new Date(data.suspended_at).getTime() +
              data.suspend_duration * 24 * 60 * 60 * 1000
            ).toISOString()
          : null,
      }
    }

    return NextResponse.json({
      status: 'ok',
      db: 'connected',
      timestamp: new Date().toISOString(),
      lifted_count: lifted?.length ?? 0,
      account,
    })

  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      db: 'disconnected',
      message: error.message,
      timestamp: new Date().toISOString(),
    }, { status: 500 })
  }
}