import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { status, suspend_duration } = await req.json()

  const { error } = await supabaseAdmin
  .from('staffs')
  .update({
    status,
    suspend_duration: status === 'suspended' ? suspend_duration : null,
    suspended_at: status === 'suspended' ? new Date().toISOString() : null,
  })
  .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}