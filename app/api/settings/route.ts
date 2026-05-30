import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('general_settings')
      .select('*')
      .maybeSingle()

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()

    const { data: existing } = await supabase
      .from('general_settings')
      .select('id')
      .maybeSingle()

    let result
    if (existing) {
      result = await supabase
        .from('general_settings')
        .update({ ...body, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single()
    } else {
      result = await supabase
        .from('general_settings')
        .insert(body)
        .select()
        .single()
    }

    if (result.error) throw result.error

    return NextResponse.json({ message: 'Settings saved successfully.', data: result.data })
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}
