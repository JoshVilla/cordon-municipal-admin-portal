import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ typeId: string }> }
) {
  try {
    const { typeId } = await params
    const { fields } = await req.json()

    if (!Array.isArray(fields)) {
      return NextResponse.json({ message: 'fields array is required.' }, { status: 400 })
    }

    await Promise.all(
      fields.map(({ id, sort_order }: { id: string; sort_order: number }) =>
        supabase
          .from('municipal_document_fields')
          .update({ sort_order })
          .eq('id', id)
          .eq('document_type_id', typeId)
      )
    )

    return NextResponse.json({ message: 'Fields reordered successfully.' })
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}
