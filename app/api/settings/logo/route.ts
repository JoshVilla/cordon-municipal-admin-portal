import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('logo') as File | null

    if (!file) {
      return NextResponse.json({ message: 'No file provided.' }, { status: 400 })
    }

    const ext = file.name.split('.').pop()
    const path = `logo/municipality_logo_${Date.now()}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const { error: uploadError } = await supabase.storage
      .from('portal-assets')
      .upload(path, buffer, { contentType: file.type, upsert: true })

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('portal-assets')
      .getPublicUrl(path)

    return NextResponse.json({ url: publicUrl })
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}
