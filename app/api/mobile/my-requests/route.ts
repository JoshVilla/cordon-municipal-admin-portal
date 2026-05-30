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
    const { searchParams } = new URL(req.url)
    const user_id = searchParams.get('user_id')

    if (!user_id) {
      return NextResponse.json({ message: 'user_id is required.' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('municipal_document_submissions')
      .select(`
        id,
        reference_number,
        status,
        payment_status,
        total_amount,
        form_data,
        uploaded_files,
        created_at,
        document_request_types (
          id,
          name,
          description,
          processing_days
        )
      `)
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ data }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}
