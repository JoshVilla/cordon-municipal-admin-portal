import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
    const body = await req.json()
    const { status, category, target_audience, visibility, search } = body

    let query = supabaseAdmin.from('announcements').select('*')



    if (status) query = query.eq('status', status)
    if (category) query = query.eq('category', category)
    if (target_audience) query = query.eq('target_audience', target_audience)
    if (visibility !== undefined) query = query.eq('visibility', visibility)
    if (search) query = query.ilike('title', `%${search}%`)

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({
        data,
        message: 'Announcements fetched successfully',
    })
}