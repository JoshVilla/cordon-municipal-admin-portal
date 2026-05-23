import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const { data, error } = await supabaseAdmin.from('staffs').select('*')
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({
    data,
    message: 'Staff fetched successfully',
    stats: {
      total: data.length,
      active: data.filter((staff) => staff.status === 'active').length,
      inactive: data.filter((staff) => staff.status === 'inactive').length,
      suspended: data.filter((staff) => staff.status === 'suspended').length
    }
  })
}
