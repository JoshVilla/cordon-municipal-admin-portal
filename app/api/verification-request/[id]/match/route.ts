import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function normalize(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, ' ')
}

function tokenize(s: string): string[] {
  return normalize(s).split(' ').filter(Boolean)
}

function jaccardSimilarity(a: string, b: string): number {
  const setA = new Set(tokenize(a))
  const setB = new Set(tokenize(b))
  if (setA.size === 0 && setB.size === 0) return 1
  if (setA.size === 0 || setB.size === 0) return 0
  let intersection = 0
  for (const token of setA) {
    if (setB.has(token)) intersection++
  }
  const union = new Set([...setA, ...setB]).size
  return intersection / union
}

function digitsOnly(s: string): string {
  return s.replace(/\D/g, '')
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const { data: request, error: reqError } = await supabase
      .from('verification_requests')
      .select('name, email, phone_number, barangay')
      .eq('id', id)
      .single()

    if (reqError) throw reqError

    const { data: citizens, error: citError } = await supabase
      .from('citizens')
      .select('id, first_name, middle_name, last_name, suffix, email, contact_number, barangay')
      .eq('status', 'Active')

    if (citError) throw citError

    const WEIGHTS = { name: 0.50, barangay: 0.25, email: 0.15, phone: 0.10 }

    const scored = citizens.map(c => {
      const citizenFullName = [c.first_name, c.middle_name, c.last_name, c.suffix]
        .filter(Boolean).join(' ')

      const nameScore = jaccardSimilarity(request.name ?? '', citizenFullName)

      const barangayScore =
        request.barangay && c.barangay
          ? normalize(request.barangay) === normalize(c.barangay) ? 1 : 0
          : 0

      const emailScore =
        request.email && c.email
          ? normalize(request.email) === normalize(c.email) ? 1 : 0
          : 0

      const phoneScore =
        request.phone_number && c.contact_number
          ? digitsOnly(request.phone_number) === digitsOnly(c.contact_number) ? 1 : 0
          : 0

      const overall =
        nameScore * WEIGHTS.name +
        barangayScore * WEIGHTS.barangay +
        emailScore * WEIGHTS.email +
        phoneScore * WEIGHTS.phone

      return {
        citizen_id: c.id,
        citizen_name: citizenFullName,
        barangay: c.barangay,
        email: c.email ?? null,
        contact_number: c.contact_number ?? null,
        scores: {
          name: Math.round(nameScore * 100),
          barangay: Math.round(barangayScore * 100),
          email: Math.round(emailScore * 100),
          phone: Math.round(phoneScore * 100),
          overall: Math.round(overall * 100),
        },
      }
    })

    const topMatches = scored
      .sort((a, b) => b.scores.overall - a.scores.overall)
      .slice(0, 5)

    return NextResponse.json({ matches: topMatches })
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}
