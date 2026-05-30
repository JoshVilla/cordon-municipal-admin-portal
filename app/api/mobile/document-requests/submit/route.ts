import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function generateReferenceNumber(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `REQ-${date}-${rand}`
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 })
}

export async function POST(req: NextRequest) {
  const text = await req.text()
  console.log('[submit] raw body:', text)

  let document_type_id: string | undefined
  let form_data: Record<string, unknown> = {}
  let user_id: string | undefined

  try {
    const body = JSON.parse(text)
    document_type_id = body?.document_type_id
    form_data = body?.form_data ?? {}
    user_id = body?.user_id
  } catch {
    return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 })
  }

  console.log('[submit] document_type_id:', document_type_id)

  if (!document_type_id) {
    return NextResponse.json(
      { message: 'Document type ID is required' },
      { status: 400 }
    )
  }

  const { data: docType, error: docTypeError } = await supabase
    .from('document_request_types')
    .select('id, name, price, processing_days, is_active')
    .eq('id', document_type_id)
    .single()

  if (docTypeError || !docType) {
    return NextResponse.json({ message: 'Document type not found' }, { status: 404 })
  }

  if (!docType.is_active) {
    return NextResponse.json(
      { message: 'This document type is currently unavailable' },
      { status: 422 }
    )
  }

  const { data: submission, error: insertError } = await supabase
    .from('municipal_document_submissions')
    .insert({
      user_id: user_id ?? null,
      document_type_id,
      reference_number: generateReferenceNumber(),
      status: 'pending',
      payment_status: 'unpaid',
      total_amount: docType.price ?? 0,
      form_data,
      uploaded_files: {},
    })
    .select()
    .single()

  if (insertError) {
    console.error('[submit] insert error:', insertError.message)
    return NextResponse.json({ message: insertError.message }, { status: 500 })
  }

  return NextResponse.json(
    {
      data: {
        id: submission.id,
        reference_number: submission.reference_number,
        status: submission.status,
        payment_status: submission.payment_status,
        total_amount: submission.total_amount,
        processing_days: docType.processing_days,
        document_type_name: docType.name,
      },
    },
    { status: 201 }
  )
}