import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase/server";

// POST /api/admin/set-pin
// Body: { email: string, pin: string (6 digits) }
// Auth: Bearer <access_token> — must belong to a member with is_admin=true.
//
// Looks up the target auth user by email (creating one if missing), sets the
// PIN as their password via the service-role admin API, and links the auth
// user id back to the members row.

export async function POST(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) {
    return NextResponse.json({ error: "Missing Authorization header" }, { status: 401 });
  }

  // Verify the caller's session and admin status using an anon client bound
  // to their access token.
  const callerClient = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: userData, error: userErr } = await callerClient.auth.getUser(token);
  if (userErr || !userData?.user) {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }
  const callerAuthId = userData.user.id;

  const { data: callerMember, error: memberErr } = await callerClient
    .from("members")
    .select("is_admin")
    .eq("auth_user_id", callerAuthId)
    .maybeSingle();
  if (memberErr) {
    return NextResponse.json({ error: memberErr.message }, { status: 500 });
  }
  if (!callerMember?.is_admin) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

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

  // Confirm the email is on the roster. Marshall emails include .YYYY class
  // year but roster usernames don't — match both variants.
  const localPart = email.split("@")[0];
  const stripped = localPart.replace(/\.\d{4}$/, "");
  const { data: targetMember, error: targetErr } = await admin
    .from("members")
    .select("id, auth_user_id, username, full_name")
    .or(`username.eq.${stripped},username.eq.${localPart},username.eq.${email}`)
    .maybeSingle();
  if (targetErr) {
    return NextResponse.json({ error: targetErr.message }, { status: 500 });
  }
  if (!targetMember) {
    return NextResponse.json(
      { error: "No roster match for that email — add the member first." },
      { status: 404 }
    );
  }

  // Find or create the auth user for this email.
  let authUserId = targetMember.auth_user_id as string | null;

  if (!authUserId) {
    // Try to find an existing auth user by email (e.g. if a magic-link
    // signup created one earlier without linking).
    const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
    const existing = list?.users?.find((u) => u.email?.toLowerCase() === email);
    if (existing) {
      authUserId = existing.id;
    } else {
      const created = await admin.auth.admin.createUser({
        email,
        password: pin,
        email_confirm: true,
      });
      if (created.error || !created.data.user) {
        return NextResponse.json(
          { error: created.error?.message || "Failed to create auth user" },
          { status: 500 }
        );
      }
      authUserId = created.data.user.id;
    }
  }

  // Update (or set) the PIN as the auth password.
  const updated = await admin.auth.admin.updateUserById(authUserId, {
    password: pin,
    email_confirm: true,
  });
  if (updated.error) {
    return NextResponse.json({ error: updated.error.message }, { status: 500 });
  }

  // Link the members row to the auth user if not already linked.
  if (targetMember.auth_user_id !== authUserId) {
    const { error: linkErr } = await admin
      .from("members")
      .update({ auth_user_id: authUserId })
      .eq("id", targetMember.id);
    if (linkErr) {
      return NextResponse.json(
        { error: `PIN set, but failed to link member row: ${linkErr.message}` },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({
    ok: true,
    member: { id: targetMember.id, full_name: targetMember.full_name, email },
  });
}
