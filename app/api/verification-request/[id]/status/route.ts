import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { status } = await req.json()

    const validStatuses = ['pending', 'verified', 'rejected', 'not_verified']
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({ message: 'Invalid status.' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('verification_requests')
      .update({ status })
      .eq('id', id)
      .select('id, status')
      .single()

    if (error) throw error

    return NextResponse.json({ message: 'Status updated successfully.', data })
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}
