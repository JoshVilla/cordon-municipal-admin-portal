import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 })
}

export async function GET(req: NextRequest) {
  try {
    const user_id = req.nextUrl.searchParams.get('user_id')

    if (!user_id) {
      return NextResponse.json({ message: 'user_id is required.' }, { status: 400 })
    }

    const { data: user, error } = await supabase
      .from('app_users')
      .select('id, email, first_name, middle_name, last_name, phone_number, suffix, barangay, verification_status, created_at')
      .eq('id', user_id)
      .maybeSingle()

    if (error) throw error

    if (!user) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 })
    }

    return NextResponse.json({ user }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}
