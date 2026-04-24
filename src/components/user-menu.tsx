"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { useSupabaseSession } from "@/lib/supabase/use-session";

/**
 * Signed-in user menu that lives in the far-right of SiteHeader.
 * Shows the member's avatar (or monogram fallback) and opens a
 * dropdown with profile / dashboard / admin / sign-out links.
 *
 * Returns null when no one is signed in — the parent header then
 * renders the "Log in" dropdown instead.
 */
export function UserMenu() {
  const { user, profile, loading } = useSupabaseSession();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (loading || !user) return null;

  const avatarUrl = publicAvatarUrl(profile?.avatar_path ?? null);
  const initials = getInitials(profile?.full_name ?? user.email ?? "");
  const firstName = (profile?.full_name || "").split(" ")[0] || user.email;

  async function signOut() {
    const sb = getSupabaseBrowser();
    if (sb) await sb.auth.signOut();
    window.location.href = "/";
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        style={{ marginTop: 3 }}
        className="inline-flex items-center justify-center h-9 w-9 rounded-full border border-[var(--color-cardinal)] bg-[var(--color-paper)] hover:border-[var(--color-cardinal-deep)] transition-colors overflow-hidden"
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt={profile?.full_name || "Profile"}
            className="block w-full h-full object-cover rounded-full"
          />
        ) : (
          <span className="font-[family-name:var(--font-display)] text-xs text-[var(--color-cardinal)] leading-none">
            {initials}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+4px)] w-[240px] bg-[var(--color-paper)] border hairline shadow-md z-50"
        >
          <div className="px-4 py-3 border-b hairline">
            <div className="rule-label text-[10px]">Signed in</div>
            <div className="mt-1 font-[family-name:var(--font-display)] text-base truncate">
              {firstName}
            </div>
            <div className="text-[11px] font-mono text-[var(--color-muted)] truncate">
              {user.email}
            </div>
          </div>
          <div className="divide-y hairline">
            <Link
              href="/dashboard?tab=profile"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between h-11 px-4 text-sm hover:bg-[var(--color-bone)]"
            >
              <span>My profile</span>
              <span className="text-[var(--color-cardinal)]">→</span>
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between h-11 px-4 text-sm hover:bg-[var(--color-bone)]"
            >
              <span>Dashboard</span>
              <span className="text-[var(--color-cardinal)]">→</span>
            </Link>
            {profile?.is_admin && (
              <Link
                href="/dashboard?tab=admin"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between h-11 px-4 text-sm hover:bg-[var(--color-bone)]"
              >
                <span>Admin settings</span>
                <span className="text-[var(--color-cardinal)]">→</span>
              </Link>
            )}
            <button
              type="button"
              onClick={signOut}
              className="flex items-center justify-between w-full h-11 px-4 text-sm hover:bg-[var(--color-bone)] text-[var(--color-muted)] hover:text-[var(--color-cardinal)]"
            >
              <span>Sign out</span>
              <span>↩</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function getInitials(nameOrEmail: string): string {
  // If we fell back to an email (no profile loaded yet), strip the domain
  // and the trailing .YYYY class-year suffix so the initials come from
  // "connor.chisick" → CC, not "connor...edu" → CE.
  const source = nameOrEmail.includes("@")
    ? nameOrEmail.split("@")[0].replace(/\.\d{4}$/, "")
    : nameOrEmail;
  const clean = source.replace(/\([^)]*\)/g, "").replace(/['"]/g, "").trim();
  const parts = clean.split(/[\s.]+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function publicAvatarUrl(p: string | null): string | null {
  if (!p) return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base.replace(/\/+$/, "")}/storage/v1/object/public/avatars/${p}`;
}
