import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 })
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()

    const email        = formData.get('email') as string
    const password     = formData.get('password') as string
    const firstName    = formData.get('firstName') as string
    const lastName     = formData.get('lastName') as string
    const middleName   = formData.get('middleName') as string | null
    const suffix       = formData.get('suffix') as string | null
    const phoneNumber  = formData.get('phoneNumber') as string | null
    const dateOfBirth  = formData.get('dateOfBirth') as string | null
    const sex          = formData.get('sex') as string | null
    const barangay     = formData.get('barangay') as string | null

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { message: 'email, password, firstName, and lastName are required.' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters.' },
        { status: 400 }
      )
    }

    const { data: existing } = await supabase
      .from('app_users')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { message: 'An account with this email already exists.' },
        { status: 409 }
      )
    }

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) {
      return NextResponse.json({ message: authError.message }, { status: 400 })
    }

    const { data: user, error: insertError } = await supabase
      .from('app_users')
      .insert({
        auth_id: authData.user.id,
        email,
        suffix,
        first_name: firstName,
        last_name: lastName,
        middle_name: middleName ?? null,
        phone_number: phoneNumber ?? null,
        date_of_birth: dateOfBirth ?? null,
        sex: sex ?? null,
        barangay: barangay ?? null,
        id_file_path: null,
        verification_status: 'not_verified',
      })
      .select('id, email, first_name, suffix, middle_name, last_name, phone_number, barangay, verification_status, created_at')
      .single()

    if (insertError) {
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ message: insertError.message }, { status: 500 })
    }

    return NextResponse.json(
      {
        message: 'Account registered successfully.',
        user,
      },
      { status: 201 }
    )
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}
