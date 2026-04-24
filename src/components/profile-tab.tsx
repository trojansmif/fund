"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { useSupabaseSession, type MemberProfile } from "@/lib/supabase/use-session";

export function ProfileTab() {
  const { loading, configured, user, profile, refreshProfile } = useSupabaseSession();
  const [linkedin, setLinkedin] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    if (profile) setLinkedin(profile.linkedin_url ?? "");
  }, [profile]);

  if (!configured) {
    return (
      <Card>
        <Heading eyebrow="Not configured" title="Profile is offline." />
        <p className="mt-4 text-sm text-[var(--color-muted)] leading-relaxed max-w-xl">
          Supabase environment variables aren't set in Vercel yet. The Fund
          CTO needs to finish the auth integration before profiles are
          available.
        </p>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <div className="text-sm text-[var(--color-muted)] font-mono uppercase">
          Loading profile…
        </div>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
        <Heading eyebrow="Sign in" title="Your profile is members-only." />
        <p className="mt-4 text-sm text-[var(--color-muted)] leading-relaxed max-w-xl">
          Sign in with your USC email to see and edit your member profile,
          claim your LinkedIn link, and manage your pitches.
        </p>
        <Link
          href="/sign-in?next=/dashboard"
          className="mt-6 inline-flex items-center gap-2 bg-[var(--color-cardinal)] text-[var(--color-paper)] px-5 py-3 text-xs uppercase font-mono hover:bg-[var(--color-cardinal-deep)]"
        >
          Sign in with USC email →
        </Link>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card>
        <Heading eyebrow="Unmatched" title={`No roster entry for ${user.email}.`} />
        <p className="mt-4 text-sm text-[var(--color-muted)] leading-relaxed max-w-xl">
          Your USC email didn't auto-match a member row. If you're on the
          Fund, ask an admin (Exec Committee) to link your account. Signed
          in as <span className="font-mono">{user.email}</span>.
        </p>
        <button
          onClick={async () => {
            const sb = getSupabaseBrowser();
            if (sb) await sb.auth.signOut();
          }}
          className="mt-6 text-xs font-mono uppercase text-[var(--color-muted)] hover:text-[var(--color-cardinal)] border-b hairline pb-1"
        >
          Sign out
        </button>
      </Card>
    );
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setSaving(true);
    const sb = getSupabaseBrowser();
    if (!sb || !profile) return;
    const trimmed = linkedin.trim();
    if (trimmed && !/^https?:\/\/(?:www\.)?linkedin\.com\//i.test(trimmed)) {
      setMsg({ kind: "err", text: "Paste a full LinkedIn profile URL (https://www.linkedin.com/...)" });
      setSaving(false);
      return;
    }
    const { error } = await sb
      .from("members")
      .update({ linkedin_url: trimmed || null })
      .eq("id", profile.id);
    if (error) {
      setMsg({ kind: "err", text: error.message });
    } else {
      setMsg({ kind: "ok", text: "LinkedIn URL saved." });
      await refreshProfile();
    }
    setSaving(false);
  }

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <Card span="md:col-span-7">
        <Heading eyebrow={`Signed in · ${user.email}`} title={profile.full_name} />
        <div className="mt-6 grid grid-cols-2 gap-5">
          <Field label="Username" value={profile.username} />
          <Field label="Team" value={profile.team} />
          <Field label="Role" value={profile.role} wide />
          <Field label="Admin" value={profile.is_admin ? "Yes" : "No"} tone={profile.is_admin ? "positive" : "neutral"} />
        </div>
        <div className="mt-8 pt-6 border-t hairline">
          <button
            onClick={async () => {
              const sb = getSupabaseBrowser();
              if (sb) await sb.auth.signOut();
            }}
            className="text-xs font-mono uppercase text-[var(--color-muted)] hover:text-[var(--color-cardinal)] border-b hairline pb-1"
          >
            Sign out
          </button>
        </div>
      </Card>

      <Card span="md:col-span-5" title="Your LinkedIn">
        <p className="text-sm text-[var(--color-muted)] leading-relaxed">
          Paste your full LinkedIn profile URL. It'll show on your card across the site.
        </p>
        <form onSubmit={save} className="mt-4 space-y-3">
          <input
            type="url"
            value={linkedin}
            onChange={(e) => setLinkedin(e.target.value)}
            placeholder="https://www.linkedin.com/in/your-handle"
            className="w-full border hairline bg-[var(--color-paper)] px-3 py-2 font-mono text-sm outline-none focus:border-[var(--color-cardinal)]"
          />
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-[var(--color-cardinal)] text-[var(--color-paper)] px-4 py-2 text-xs uppercase font-mono hover:bg-[var(--color-cardinal-deep)] disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            {profile.linkedin_url && (
              <a
                href={profile.linkedin_url}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-mono uppercase text-[var(--color-cardinal)] border-b border-[var(--color-cardinal)] pb-0.5"
              >
                Open ↗
              </a>
            )}
          </div>
          {msg && (
            <div
              className={`text-[11px] font-mono uppercase px-3 py-2 border ${
                msg.kind === "ok"
                  ? "border-[var(--color-positive)] text-[var(--color-positive)]"
                  : "border-[var(--color-negative)] text-[var(--color-negative)]"
              }`}
            >
              {msg.text}
            </div>
          )}
        </form>
      </Card>
    </div>
  );
}

function Heading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <>
      <div className="rule-label">{eyebrow}</div>
      <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl md:text-3xl leading-tight">{title}</h2>
    </>
  );
}

function Field({
  label,
  value,
  wide,
  tone = "neutral",
}: {
  label: string;
  value: string;
  wide?: boolean;
  tone?: "neutral" | "positive";
}) {
  return (
    <div className={wide ? "col-span-2" : ""}>
      <div className="rule-label">{label}</div>
      <div
        className={`mt-1 text-[15px] ${
          tone === "positive" ? "text-[var(--color-positive)]" : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function Card({
  children,
  span = "md:col-span-12",
  title,
}: {
  children: React.ReactNode;
  span?: string;
  title?: string;
}) {
  return (
    <div className={`col-span-12 ${span} border hairline bg-[var(--color-paper)]`}>
      {title && (
        <div className="px-4 md:px-5 py-3 border-b hairline bg-[var(--color-bone)]">
          <div className="rule-label">{title}</div>
        </div>
      )}
      <div className="px-4 md:px-5 py-4 md:py-5">{children}</div>
    </div>
  );
}
