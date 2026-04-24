"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getSupabaseBrowser, isSupabaseConfigured } from "@/lib/supabase/client";

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-3xl px-4 sm:px-6 py-24 text-sm text-[var(--color-muted)]">Loading…</div>}>
      <SignInContent />
    </Suspense>
  );
}

function SignInContent() {
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [configured, setConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    setConfigured(isSupabaseConfigured());
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      setErr("Supabase is not configured yet. Check with the Fund CTO.");
      setBusy(false);
      return;
    }
    const lower = email.trim().toLowerCase();
    if (!/^[^@\s]+@(?:[a-z0-9.-]+\.)?usc\.edu$/.test(lower)) {
      setErr("Use your USC email address — @usc.edu, @marshall.usc.edu, @viterbi.usc.edu, or @dornsife.usc.edu.");
      setBusy(false);
      return;
    }
    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/dashboard`
        : undefined;
    const { error } = await supabase.auth.signInWithOtp({
      email: lower,
      options: { emailRedirectTo: redirectTo, shouldCreateUser: true },
    });
    if (error) {
      setErr(error.message);
    } else {
      setSent(true);
    }
    setBusy(false);
  }

  const next = params.get("next");

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16 md:py-24">
      <div className="rule-label flex items-center gap-3">
        <span className="inline-block h-px w-8 bg-[var(--color-cardinal)]" />
        Sign in
      </div>
      <h1 className="mt-4 font-[family-name:var(--font-display)] text-[clamp(2rem,5vw,3rem)] leading-[1.1] font-medium">
        Members sign-in.
      </h1>
      <p className="mt-6 text-[var(--color-muted)] max-w-xl leading-relaxed">
        Enter your USC email. We'll send you a one-time sign-in link — no
        password to remember, nothing stored on your device.
        {next && <span> You'll be routed to <span className="font-mono">{next}</span> after signing in.</span>}
      </p>

      {configured === false && (
        <div className="mt-8 border border-[var(--color-cardinal)] bg-[var(--color-bone)] p-4 text-sm">
          <div className="rule-label text-[var(--color-cardinal)] mb-1">Setup pending</div>
          Authentication isn't fully configured yet. The Fund CTO will finish
          linking Supabase environment variables in Vercel.
        </div>
      )}

      {!sent ? (
        <form onSubmit={submit} className="mt-10 max-w-lg space-y-4">
          <label className="block">
            <span className="rule-label mb-2 block">USC email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="firstname.lastname@usc.edu"
              className="w-full border hairline bg-[var(--color-paper)] px-3 py-3 font-mono text-sm outline-none focus:border-[var(--color-cardinal)]"
            />
          </label>

          {err && (
            <div className="text-xs text-[var(--color-negative)] font-mono uppercase border border-[var(--color-negative)] px-3 py-2">
              {err}
            </div>
          )}

          <button
            type="submit"
            disabled={busy || configured === false}
            className="w-full sm:w-auto bg-[var(--color-cardinal)] text-[var(--color-paper)] px-6 py-3 text-xs uppercase font-mono hover:bg-[var(--color-cardinal-deep)] disabled:opacity-50"
          >
            {busy ? "Sending…" : "Send me a sign-in link"}
          </button>

          <p className="pt-4 text-xs text-[var(--color-muted)] leading-relaxed">
            Only USC-domain emails are accepted. Rejections from non-USC
            addresses are enforced at the database layer.
          </p>
        </form>
      ) : (
        <div className="mt-10 max-w-lg border hairline bg-[var(--color-bone)] p-6 md:p-8">
          <div className="rule-label flex items-center gap-3">
            <span className="inline-block w-2 h-2 bg-[var(--color-positive)] rounded-full" />
            Check your inbox
          </div>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl leading-tight">
            Sign-in link sent to <br />
            <span className="font-mono text-base text-[var(--color-cardinal)]">{email}</span>
          </h2>
          <p className="mt-4 text-sm text-[var(--color-muted)] leading-relaxed">
            Open the email and click the link. It expires in 1 hour. No
            password needed — you'll land on the dashboard automatically.
          </p>
          <button
            onClick={() => {
              setSent(false);
              setEmail("");
            }}
            className="mt-6 text-xs font-mono uppercase text-[var(--color-cardinal)] border-b border-[var(--color-cardinal)] pb-0.5"
          >
            Send to a different email
          </button>
        </div>
      )}

      <div className="mt-16 border-t hairline pt-6 text-xs text-[var(--color-muted)] flex flex-wrap gap-4">
        <Link href="/" className="hover:text-[var(--color-cardinal)]">← Back to home</Link>
        <span>·</span>
        <Link href="/leadership" className="hover:text-[var(--color-cardinal)]">Public roster</Link>
        <span>·</span>
        <Link href="/portfolio" className="hover:text-[var(--color-cardinal)]">Live portfolio</Link>
      </div>
    </div>
  );
}
