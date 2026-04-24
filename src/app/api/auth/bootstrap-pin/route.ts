import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";

// POST /api/auth/bootstrap-pin
// Body: { email: string, pin: string (6 digits) }
//
// First-time PIN setup for a roster member who hasn't claimed their account.
// Creates an auth user with the PIN as the password and links it to the
// members row. Refuses if:
//   - email not on roster
//   - member already has an auth_user_id (i.e. PIN already set — they must
//     either sign in or ask an admin to reset)
//
// After success, the client calls supabase.auth.signInWithPassword to
// establish a session with the new PIN.

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const pin = typeof body.pin === "string" ? body.pin.trim() : "";

  if (!/@marshall\.usc\.edu$/i.test(email)) {
    return NextResponse.json({ error: "Email must be @marshall.usc.edu" }, { status: 400 });
  }
  if (!/^\d{6}$/.test(pin)) {
    return NextResponse.json({ error: "PIN must be exactly 6 digits" }, { status: 400 });
  }

  const admin = getSupabaseAdmin();
  const localPart = email.split("@")[0];
  const stripped = localPart.replace(/\.\d{4}$/, "");

  const { data: member, error: memberErr } = await admin
    .from("members")
    .select("id, auth_user_id, full_name")
    .or(`username.eq.${stripped},username.eq.${localPart},username.eq.${email}`)
    .maybeSingle();
  if (memberErr) {
    return NextResponse.json({ error: memberErr.message }, { status: 500 });
  }
  if (!member) {
    return NextResponse.json(
      { error: "That email isn't on the Fund roster." },
      { status: 404 }
    );
  }
  if (member.auth_user_id) {
    return NextResponse.json(
      { error: "A PIN is already set for this account. Sign in, or ask an admin to reset it." },
      { status: 409 }
    );
  }

  // Create the auth user. If an orphan auth user already exists for this
  // email (from a prior magic-link signup), reuse it.
  let authUserId: string | null = null;
  const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  const existing = list?.users?.find((u) => u.email?.toLowerCase() === email);
  if (existing) {
    authUserId = existing.id;
    const updated = await admin.auth.admin.updateUserById(existing.id, {
      password: pin,
      email_confirm: true,
    });
    if (updated.error) {
      return NextResponse.json({ error: updated.error.message }, { status: 500 });
    }
  } else {
    const created = await admin.auth.admin.createUser({
      email,
      password: pin,
      email_confirm: true,
    });
    if (created.error || !created.data.user) {
      return NextResponse.json(
        { error: created.error?.message || "Failed to create account." },
        { status: 500 }
      );
    }
    authUserId = created.data.user.id;
  }

  const { error: linkErr } = await admin
    .from("members")
    .update({ auth_user_id: authUserId })
    .eq("id", member.id);
  if (linkErr) {
    return NextResponse.json(
      { error: `PIN set, but failed to link roster row: ${linkErr.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, full_name: member.full_name });
}
