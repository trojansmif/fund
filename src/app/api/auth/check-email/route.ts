import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";

// POST /api/auth/check-email
// Body: { email: string }
// Returns: { status: "existing" | "needs_pin" | "not_found", full_name?: string }
//
// Used by /sign-in to branch the UX: if the caller's Marshall email maps
// to a roster row that's already linked to an auth user, they see a PIN
// field. If it's on the roster but unlinked, they get the "create your PIN"
// flow. If not on the roster, they're rejected.

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!/@marshall\.usc\.edu$/i.test(email)) {
    return NextResponse.json(
      { status: "not_found", error: "Use your @marshall.usc.edu email." },
      { status: 400 }
    );
  }

  const admin = getSupabaseAdmin();
  const localPart = email.split("@")[0];
  // Marshall emails are firstname.lastname.YYYY — roster usernames omit the
  // class year, so strip any trailing .4-digit segment before matching.
  const stripped = localPart.replace(/\.\d{4}$/, "");

  const { data: member, error } = await admin
    .from("members")
    .select("id, auth_user_id, full_name, username")
    .or(`username.eq.${stripped},username.eq.${localPart},username.eq.${email}`)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ status: "not_found", error: error.message }, { status: 500 });
  }

  if (!member) {
    return NextResponse.json({ status: "not_found" });
  }

  if (member.auth_user_id) {
    return NextResponse.json({ status: "existing", full_name: member.full_name });
  }

  return NextResponse.json({ status: "needs_pin", full_name: member.full_name });
}
