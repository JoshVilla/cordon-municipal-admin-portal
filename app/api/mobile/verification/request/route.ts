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
    console.log(formData.get('phone_number'))

    const userId      = formData.get('user_id') as string
    const idType      = formData.get('id_type') as string
    const idNumber    = formData.get('id_number') as string
    const name        = formData.get('name') as string
    const email       = formData.get('email') as string
    const phoneNumber = formData.get('phone_number') as string | null
    const barangay    = formData.get('barangay') as string
    const idFront     = formData.get('id_front') as File | null
    const idBack      = formData.get('id_back') as File | null

    if (!userId || !idType || !idNumber || !name || !email || !barangay) {
      return NextResponse.json(
        { message: 'user_id, id_type, id_number, name, email, and barangay are required.' },
        { status: 400 }
      )
    }

    if (!idFront) {
      return NextResponse.json(
        { message: 'id_front is required.' },
        { status: 400 }
      )
    }

    const { data: user, error: userError } = await supabase
      .from('app_users')
      .select('id')
      .eq('id', userId)
      .maybeSingle()

    if (userError || !user) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 })
    }

    const { data: existing } = await supabase
      .from('verification_requests')
      .select('id, status')
      .eq('user_id', userId)
      .in('status', ['pending', 'approved'])
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { message: 'A verification request is already pending or approved for this user.' },
        { status: 409 }
      )
    }

    const uploadFile = async (file: File, label: string) => {
      const ext      = file.name.split('.').pop()
      const path     = `verification/${userId}/${label}_${Date.now()}.${ext}`
      const buffer   = Buffer.from(await file.arrayBuffer())

      const { error } = await supabase.storage
        .from('id-verification')
        .upload(path, buffer, { contentType: file.type, upsert: false })

      if (error) throw new Error(`Failed to upload ${label}: ${error.message}`)
      return path
    }

    const idFrontPath = await uploadFile(idFront, 'id_front')
    const idBackPath  = idBack ? await uploadFile(idBack, 'id_back') : null

    const { data: request, error: insertError } = await supabase
      .from('verification_requests')
      .insert({
        user_id:       userId,
        id_type:       idType,
        id_number:     idNumber,
        name:          name,
        email:         email,
        phone_number:  phoneNumber,
        barangay:      barangay,
        id_front_path: idFrontPath,
        id_back_path:  idBackPath,
        status:        'pending',
      })
      .select('id, user_id, id_type, id_number, name, email, phone_number, barangay, status, created_at')
      .single()

    if (insertError) {
      return NextResponse.json({ message: insertError.message }, { status: 500 })
    }

    await supabase
      .from('app_users')
      .update({ verification_status: 'pending' })
      .eq('id', userId)

    return NextResponse.json(
      {
        message: 'Verification request submitted successfully.',
        request,
      },
      { status: 201 }
    )
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}
