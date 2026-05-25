import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// used only for signInWithPassword
const supabaseAuth = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// used for DB queries with service role (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 })
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()

    const email    = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
      return NextResponse.json(
        { message: 'email and password are required.' },
        { status: 400 }
      )
    }

    const { data: authData, error: authError } = await supabaseAuth.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      return NextResponse.json(
        { message: 'Invalid email or password.' },
        { status: 401 }
      )
    }

    const { data: user, error: userError } = await supabaseAdmin
      .from('app_users')
      .select('id, email, first_name, middle_name, last_name, phone_number, barangay, verification_status, created_at')
      .eq('auth_id', authData.user.id)
      .maybeSingle()

    if (userError || !user) {
      return NextResponse.json(
        { message: 'User profile not found.' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        message: 'Login successful.',
        token: authData.session.access_token,
        user,
      },
      { status: 200 }
    )
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}
