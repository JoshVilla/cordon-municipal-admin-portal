import { createClient } from '@supabase/supabase-js'
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const [total, pwd, senior, beneficiary, registered] = await Promise.all([
      supabase.from("citizens").select("*", { count: "exact", head: true }),
      supabase.from("citizens").select("*", { count: "exact", head: true }).eq("is_pwd", true),
      supabase.from("citizens").select("*", { count: "exact", head: true }).eq("is_senior_citizen", true),
      supabase.from("citizens").select("*", { count: "exact", head: true }).eq("is_4ps_beneficiary", true),
      supabase.from("citizens").select("*", { count: "exact", head: true }).eq("voter_status", "Registered"),
    ])

    if (total.error) throw total.error

    return NextResponse.json({
      total: total.count ?? 0,
      pwd: pwd.count ?? 0,
      senior: senior.count ?? 0,
      beneficiary: beneficiary.count ?? 0,
      registered_voters: registered.count ?? 0,
    })
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}
