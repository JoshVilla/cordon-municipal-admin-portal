import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
export async function POST(req: NextRequest) {
  try {

    const body = await req.json();

    const { error } = await supabase.from("citizens").insert([
      {
        first_name: body.firstName,
        middle_name: body.middleName || null,
        last_name: body.lastName,
        suffix: body.suffix === "none" ? null : body.suffix || null,
        date_of_birth: body.dateOfBirth,
        sex: body.sex,
        civil_status: body.civilStatus || null,
        contact_number: body.contactNumber || null,
        email: body.email || null,
        barangay: body.barangay,
        full_address: body.fullAddress || null,
        is_senior_citizen: body.isSeniorCitizen,
        is_pwd: body.isPWD,
        is_4ps_beneficiary: body.is4PsBeneficiary,
        voter_status: body.voterStatus,
        status: body.status,
      },
    ]);

    if (error) throw error;

    return NextResponse.json({ message: "Citizen registered successfully." }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}