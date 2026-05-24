import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...fields } = body;

    if (!id) return NextResponse.json({ message: "Citizen ID is required" }, { status: 400 });

    const { data, error } = await supabase
      .from("citizens")
      .update({
        first_name: fields.firstName,
        middle_name: fields.middleName || null,
        last_name: fields.lastName,
        suffix: fields.suffix === "none" ? null : fields.suffix || null,
        date_of_birth: fields.dateOfBirth,
        sex: fields.sex,
        civil_status: fields.civilStatus || null,
        contact_number: fields.contactNumber || null,
        email: fields.email || null,
        barangay: fields.barangay,
        full_address: fields.fullAddress || null,
        is_senior_citizen: fields.isSeniorCitizen,
        is_pwd: fields.isPWD,
        is_4ps_beneficiary: fields.is4PsBeneficiary,
        voter_status: fields.voterStatus,
        status: fields.status,
      })
      .eq("id", id)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) {
      return NextResponse.json({ message: "Citizen not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Citizen updated successfully" });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
