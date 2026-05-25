import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const { data, error } = await supabase
      .from('verification_requests')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    const signedUrls: { id_front_url?: string; id_back_url?: string } = {}

    if (data.id_front_path) {
      const { data: front } = await supabase.storage
        .from('id-verification')
        .createSignedUrl(data.id_front_path, 3600)
      if (front) signedUrls.id_front_url = front.signedUrl
    }

    if (data.id_back_path) {
      const { data: back } = await supabase.storage
        .from('id-verification')
        .createSignedUrl(data.id_back_path, 3600)
      if (back) signedUrls.id_back_url = back.signedUrl
    }

    return NextResponse.json({ data: { ...data, ...signedUrls } })
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}
