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
    const { user_id, first_name, middle_name, last_name } = await req.json()

    if (!user_id || !first_name || !last_name) {
      return NextResponse.json(
        { message: 'user_id, first_name, and last_name are required.' },
        { status: 400 }
      )
    }

    const [{ data: citizen, error: citizenError }, { data: appUser, error: userError }] =
      await Promise.all([
        supabase
          .from('citizens')
          .select('first_name, middle_name, last_name, date_of_birth, sex, barangay, full_address, contact_number')
          .eq('first_name', first_name)
          .eq('middle_name', middle_name ?? '')
          .eq('last_name', last_name)
          .maybeSingle(),
        supabase
          .from('app_users')
          .select('first_name, middle_name, last_name, date_of_birth, sex, barangay, full_address, phone_number')
          .eq('id', user_id)
          .maybeSingle(),
      ])

    if (citizenError) throw citizenError
    if (userError) throw userError

    if (!citizen) {
      return NextResponse.json({ message: 'No matching citizen found.' }, { status: 404 })
    }

    if (!appUser) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 })
    }

    const candidateUpdates: Record<string, any> = {
      first_name:    citizen.first_name,
      middle_name:   citizen.middle_name,
      last_name:     citizen.last_name,
      date_of_birth: citizen.date_of_birth,
      sex:           citizen.sex,
      barangay:      citizen.barangay,
      full_address:  citizen.full_address,
      phone_number:  citizen.contact_number,
    }

    const appUserMapped: Record<string, any> = {
      first_name:    appUser.first_name,
      middle_name:   appUser.middle_name,
      last_name:     appUser.last_name,
      date_of_birth: appUser.date_of_birth,
      sex:           appUser.sex,
      barangay:      appUser.barangay,
      full_address:  appUser.full_address,
      phone_number:  appUser.phone_number,
    }

    const changes: Record<string, any> = {}
    for (const key of Object.keys(candidateUpdates)) {
      if (candidateUpdates[key] !== appUserMapped[key]) {
        changes[key] = candidateUpdates[key]
      }
    }

    changes.use_info_from_portal = 'yes'

     const [{ error: updateError }, { error: verifyError }] = await Promise.all([
      supabase
        .from('app_users')
        .update(changes)
        .eq('id', user_id),
      supabase
        .from('citizens')
        .update({ verification_status: 'verified' })
        .eq('first_name', first_name)
        .eq('middle_name', middle_name ?? '')
        .eq('last_name', last_name),
    ])


    if (updateError) throw updateError
      if (verifyError) throw verifyError

    return NextResponse.json({
      message: 'Profile synced successfully.',
      updated_fields: Object.keys(changes).filter(k => k !== 'use_info_from_portal'),
    }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}
