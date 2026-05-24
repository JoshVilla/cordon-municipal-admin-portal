import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()

  if (!id) return NextResponse.json({ message: 'Citizen ID is required' }, { status: 400 })

  const { error } = await supabase.from('citizens').delete().eq('id', id)

  if (error) return NextResponse.json({ message: error.message }, { status: 400 })

  return NextResponse.json({ success: true, message: 'Citizen deleted successfully' })
}
