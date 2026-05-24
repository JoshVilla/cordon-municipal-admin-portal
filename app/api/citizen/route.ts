import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const {
      page = 1,
      limit = 10,
      name,
      barangay,
      status,
      civil_status,
      is_pwd,
      is_senior_citizen,
      is_4ps_beneficiary,
      voter_status,
    } = await req.json();

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("citizens")
      .select("*", { count: "exact" })

    if (name) {
      query = query.or(
        `first_name.ilike.*${name}*,middle_name.ilike.*${name}*,last_name.ilike.*${name}*`
      )
    }
    if (barangay) query = query.eq("barangay", barangay)
    if (status) query = query.eq("status", status)
    if (civil_status) query = query.eq("civil_status", civil_status)
    if (is_pwd !== undefined) query = query.eq("is_pwd", is_pwd)
    if (is_senior_citizen !== undefined) query = query.eq("is_senior_citizen", is_senior_citizen)
    if (is_4ps_beneficiary !== undefined) query = query.eq("is_4ps_beneficiary", is_4ps_beneficiary)
    if (voter_status) query = query.eq("voter_status", voter_status)

    const [listResult, statsResult] = await Promise.all([
      query
        .order("last_name", { ascending: true })
        .order("first_name", { ascending: true })
        .range(from, to),
      Promise.all([
        supabase.from("citizens").select("*", { count: "exact", head: true }),
        supabase.from("citizens").select("*", { count: "exact", head: true }).eq("is_pwd", true),
        supabase.from("citizens").select("*", { count: "exact", head: true }).eq("is_senior_citizen", true),
        supabase.from("citizens").select("*", { count: "exact", head: true }).eq("is_4ps_beneficiary", true),
        supabase.from("citizens").select("*", { count: "exact", head: true }).eq("voter_status", "Registered"),
      ])
    ]);

    if (listResult.error) throw listResult.error;

    const [total, pwd, senior, beneficiary, registered] = statsResult;

    return NextResponse.json({
      data: listResult.data,
      count: listResult.count,
      stats: {
        total: total.count ?? 0,
        pwd: pwd.count ?? 0,
        senior: senior.count ?? 0,
        beneficiary: beneficiary.count ?? 0,
        registered_voters: registered.count ?? 0,
      }
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
