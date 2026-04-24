import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type BroadcastBody = {
  documentId: string;
  audience: { kind: "all" } | { kind: "team"; team: string } | { kind: "members"; ids: string[] };
  subject?: string;
  message?: string;
  signedUrlHours?: number;
};

export async function POST(req: NextRequest) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const FROM = process.env.FUND_EMAIL_FROM || "Trojan SMIF <noreply@trojansmif.com>";
  const REPLY_TO = process.env.FUND_EMAIL_REPLY_TO || "trojansmif@marshall.usc.edu";

  if (!RESEND_API_KEY) {
    return NextResponse.json(
      { ok: false, error: "RESEND_API_KEY not configured." },
      { status: 500 }
    );
  }

  // 1. Authenticate the caller — the browser sends the Supabase session cookie.
  const authHeader = req.headers.get("authorization") || "";
  const jwt = authHeader.replace(/^Bearer\s+/i, "");
  if (!jwt) {
    return NextResponse.json({ ok: false, error: "Missing bearer token." }, { status: 401 });
  }

  const admin = getSupabaseAdmin();
  const { data: userResp, error: userErr } = await admin.auth.getUser(jwt);
  if (userErr || !userResp?.user) {
    return NextResponse.json({ ok: false, error: "Invalid session." }, { status: 401 });
  }

  // 2. Confirm caller is an admin (members.is_admin = true).
  const { data: memberRow } = await admin
    .from("members")
    .select("id, is_admin")
    .eq("auth_user_id", userResp.user.id)
    .maybeSingle();

  if (!memberRow?.is_admin) {
    return NextResponse.json({ ok: false, error: "Admins only." }, { status: 403 });
  }

  // 3. Parse the request.
  const body = (await req.json()) as BroadcastBody;
  if (!body.documentId) {
    return NextResponse.json({ ok: false, error: "documentId required." }, { status: 400 });
  }

  // 4. Fetch document metadata.
  const { data: doc, error: docErr } = await admin
    .from("documents")
    .select("id, storage_path, display_name, description")
    .eq("id", body.documentId)
    .maybeSingle();

  if (docErr || !doc) {
    return NextResponse.json({ ok: false, error: "Document not found." }, { status: 404 });
  }

  // 5. Resolve recipients.
  const audienceDesc =
    body.audience.kind === "all"
      ? "all"
      : body.audience.kind === "team"
      ? `team:${body.audience.team}`
      : `members:${body.audience.ids.join(",")}`;

  let recipients: { email: string; full_name: string }[] = [];
  {
    let query = admin
      .from("members")
      .select("id, full_name, email")
      .not("email", "is", null);
    if (body.audience.kind === "team") {
      query = query.eq("team", body.audience.team);
    } else if (body.audience.kind === "members") {
      query = query.in("id", body.audience.ids);
    }
    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
    recipients = (data ?? []).filter((r): r is { id: string; full_name: string; email: string } => !!r.email)
      .map((r) => ({ email: r.email, full_name: r.full_name }));
  }

  if (recipients.length === 0) {
    return NextResponse.json({ ok: false, error: "No recipients matched." }, { status: 400 });
  }

  // 6. Generate a signed download URL (default 168h = 7 days).
  const expiresIn = Math.max(3600, (body.signedUrlHours ?? 168) * 3600);
  const { data: signed, error: signErr } = await admin.storage
    .from("fund-docs")
    .createSignedUrl(doc.storage_path, expiresIn);
  if (signErr || !signed?.signedUrl) {
    return NextResponse.json(
      { ok: false, error: signErr?.message || "Could not sign URL." },
      { status: 500 }
    );
  }

  const downloadUrl = signed.signedUrl;
  const subject = body.subject || `Trojan SMIF — ${doc.display_name}`;
  const note = body.message?.trim() || "";

  // 7. Send individually via Resend (so deliverability reports per-recipient).
  let succeeded = 0;
  let failed = 0;
  const errors: string[] = [];
  const expiresLabel = `${body.signedUrlHours ?? 168}-hour signed link`;

  for (const r of recipients) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          authorization: `Bearer ${RESEND_API_KEY}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          from: FROM,
          to: r.email,
          reply_to: REPLY_TO,
          subject,
          html: renderHtml({
            name: r.full_name,
            docName: doc.display_name,
            note,
            downloadUrl,
            expiresLabel,
          }),
          text: renderText({
            name: r.full_name,
            docName: doc.display_name,
            note,
            downloadUrl,
            expiresLabel,
          }),
        }),
      });
      if (!res.ok) {
        failed++;
        const detail = await res.text().catch(() => "");
        errors.push(`${r.email}: ${res.status} ${detail.slice(0, 200)}`);
      } else {
        succeeded++;
      }
    } catch (e) {
      failed++;
      errors.push(`${r.email}: ${String(e).slice(0, 200)}`);
    }
  }

  // 8. Log the broadcast.
  await admin.from("document_sends").insert({
    document_id: doc.id,
    sent_by: userResp.user.id,
    channel: "email",
    audience: audienceDesc,
    recipient_count: recipients.length,
    message_note: note || null,
    succeeded,
    failed,
    error_detail: errors.length ? errors.slice(0, 20).join(" | ") : null,
  });

  return NextResponse.json({
    ok: true,
    recipients: recipients.length,
    succeeded,
    failed,
    downloadUrl,
  });
}

/* ────────── templates ────────── */

function renderHtml({
  name,
  docName,
  note,
  downloadUrl,
  expiresLabel,
}: {
  name: string;
  docName: string;
  note: string;
  downloadUrl: string;
  expiresLabel: string;
}) {
  const firstName = name.split(" ")[0] || "Trojan";
  return `
  <div style="font-family: ui-monospace, Menlo, Consolas, monospace; color: #0a0a0b; line-height: 1.6; max-width: 560px; margin: 0 auto; padding: 24px;">
    <div style="border-bottom: 2px solid #990000; padding-bottom: 12px; margin-bottom: 24px;">
      <div style="font-size: 12px; letter-spacing: 0.18em; color: #6b6a63; text-transform: uppercase;">Trojan SMIF</div>
      <div style="font-size: 20px; font-weight: 600; margin-top: 6px;">New document from the Fund</div>
    </div>
    <p>Hi ${escapeHtml(firstName)},</p>
    <p>A new document has been shared with you:</p>
    <div style="border: 1px solid #e6e2d6; padding: 16px; margin: 16px 0;">
      <div style="font-weight: 600; font-size: 16px;">${escapeHtml(docName)}</div>
      ${note ? `<p style="margin-top: 12px; color: #24242a;">${escapeHtml(note).replace(/\n/g, "<br/>")}</p>` : ""}
    </div>
    <p>
      <a href="${downloadUrl}" style="display: inline-block; background: #990000; color: #fbfaf6; padding: 12px 24px; text-decoration: none; font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase;">
        Open document →
      </a>
    </p>
    <p style="font-size: 12px; color: #6b6a63;">Link is a ${expiresLabel}. Re-request from an admin if it expires.</p>
    <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e6e2d6; font-size: 11px; color: #6b6a63;">
      Trojan Student Managed Investment Fund · USC Marshall · trojansmif.com
    </div>
  </div>`;
}

function renderText({
  name,
  docName,
  note,
  downloadUrl,
  expiresLabel,
}: {
  name: string;
  docName: string;
  note: string;
  downloadUrl: string;
  expiresLabel: string;
}) {
  const firstName = name.split(" ")[0] || "Trojan";
  return [
    `Hi ${firstName},`,
    "",
    `A new document has been shared with you:`,
    `  ${docName}`,
    note ? `\n${note}` : "",
    "",
    `Open it: ${downloadUrl}`,
    ``,
    `Link is a ${expiresLabel}. Re-request from an admin if it expires.`,
    ``,
    `— Trojan SMIF · USC Marshall · trojansmif.com`,
  ]
    .filter(Boolean)
    .join("\n");
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
