"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { useSupabaseSession } from "@/lib/supabase/use-session";

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <CallbackContent />
    </Suspense>
  );
}

function CallbackContent() {
  const params = useSearchParams();
  const { loading, user, profile } = useSupabaseSession();
  const [hashError, setHashError] = useState<string | null>(null);

  // Surface any error from the URL fragment (Supabase returns ?error=access_denied etc.)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const query = new URLSearchParams(window.location.search);
    const err = hash.get("error_description") || query.get("error_description");
    if (err) setHashError(decodeURIComponent(err));
  }, []);

  const nextPath = params.get("next") || "/dashboard";
  const safeNext = nextPath.startsWith("/") ? nextPath : "/dashboard";
  const isAdmin = !!profile?.is_admin;

  async function signOut() {
    const sb = getSupabaseBrowser();
    if (sb) await sb.auth.signOut();
    window.location.href = "/";
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 sm:py-16 md:py-24">
      <div className="rule-label flex items-center gap-3">
        <span className="inline-block h-px w-8 bg-[var(--color-cardinal)]" />
        Sign-in confirmation
      </div>

      {hashError ? (
        <div className="mt-6 border border-[var(--color-negative)] bg-[var(--color-bone)] p-5">
          <div className="rule-label text-[var(--color-negative)]">Sign-in failed</div>
          <p className="mt-2 text-sm break-words">{hashError}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/sign-in"
              className="text-xs font-mono uppercase px-4 py-2 bg-[var(--color-cardinal)] text-[var(--color-paper)]"
            >
              Try again
            </Link>
            <Link
              href="/"
              className="text-xs font-mono uppercase px-4 py-2 border hairline"
            >
              Back to site
            </Link>
          </div>
        </div>
      ) : loading ? (
        <p className="mt-8 text-sm text-[var(--color-muted)]">Confirming your session…</p>
      ) : !user ? (
        <div className="mt-8 border hairline bg-[var(--color-bone)] p-5 sm:p-6">
          <div className="rule-label">Not signed in</div>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-xl sm:text-2xl leading-tight">
            No active session.
          </h2>
          <p className="mt-3 text-sm text-[var(--color-muted)]">
            Your session expired or never landed. Try signing in again.
          </p>
          <Link
            href="/sign-in"
            className="mt-5 inline-flex items-center gap-2 text-xs font-mono uppercase px-4 py-2 bg-[var(--color-cardinal)] text-[var(--color-paper)] hover:bg-[var(--color-cardinal-deep)]"
          >
            Return to sign-in →
          </Link>
        </div>
      ) : (
        <div className="mt-6">
          <h1 className="font-[family-name:var(--font-display)] text-[clamp(1.75rem,5vw,3rem)] leading-[1.1] font-medium">
            You're signed in.
          </h1>
          <p className="mt-4 text-[var(--color-muted)] break-words">
            Welcome back, <span className="text-[var(--color-ink)]">{profile?.full_name || user.email}</span>. When you're ready, choose where to go.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 max-w-xl">
            <Link
              href={safeNext}
              className="block border hairline bg-[var(--color-paper)] p-5 hover:border-[var(--color-cardinal)]"
            >
              <div className="rule-label">Continue</div>
              <div className="mt-2 font-[family-name:var(--font-display)] text-lg">
                {safeNext.includes("tab=admin") ? "Admin dashboard" : "Member dashboard"}
              </div>
              <div className="mt-3 inline-flex items-center gap-2 text-xs font-mono uppercase text-[var(--color-cardinal)] border-b border-[var(--color-cardinal)] pb-0.5">
                Go to {safeNext} →
              </div>
            </Link>

            {isAdmin && !safeNext.includes("tab=admin") && (
              <Link
                href="/dashboard?tab=admin"
                className="block border hairline bg-[var(--color-paper)] p-5 hover:border-[var(--color-cardinal)]"
              >
                <div className="rule-label">Admin access</div>
                <div className="mt-2 font-[family-name:var(--font-display)] text-lg">
                  Admin dashboard
                </div>
                <div className="mt-3 inline-flex items-center gap-2 text-xs font-mono uppercase text-[var(--color-cardinal)] border-b border-[var(--color-cardinal)] pb-0.5">
                  Open admin →
                </div>
              </Link>
            )}
          </div>

          <div className="mt-10 border-t hairline pt-4 text-xs font-mono uppercase flex flex-wrap gap-4 items-center">
            <span className="text-[var(--color-muted)]">Signed in as</span>
            <span className="break-all">{user.email}</span>
            {isAdmin && (
              <span className="px-2 py-0.5 bg-[var(--color-cardinal)] text-[var(--color-paper)]">
                Admin
              </span>
            )}
            <button
              onClick={signOut}
              className="text-[var(--color-muted)] hover:text-[var(--color-cardinal)] border-b hairline pb-0.5 ml-auto"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
