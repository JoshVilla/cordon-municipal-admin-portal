import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
    const { id } = await req.json()
    const { data, error } = await supabaseAdmin.from('staffs').select('*').eq('id', id).single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({
        data,
        message: 'Staff fetched successfully'
    })
}