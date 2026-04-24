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

type Step = "email" | "existing" | "new";

function SignInContent() {
  const params = useSearchParams();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [memberName, setMemberName] = useState<string>("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [configured, setConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    setConfigured(isSupabaseConfigured());
  }, []);

  const nextPath = params.get("next") || "/dashboard";
  const safeNext = nextPath.startsWith("/") ? nextPath : "/dashboard";
  const next = params.get("next") || "";
  const isAdminMode = next.includes("tab=admin");

  async function checkEmail(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const lower = email.trim().toLowerCase();
    if (!/@marshall\.usc\.edu$/i.test(lower)) {
      setErr("Use your @marshall.usc.edu email.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: lower }),
      });
      const body = await res.json();
      if (body.status === "existing") {
        setMemberName(body.full_name || "");
        setStep("existing");
      } else if (body.status === "needs_pin") {
        setMemberName(body.full_name || "");
        setStep("new");
      } else {
        setErr(
          body.error ||
            "That email isn't on the Fund roster. Check the spelling, or ask an admin to add you."
        );
      }
    } catch (ex) {
      setErr(String(ex));
    }
    setBusy(false);
  }

  async function signInExisting(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!/^\d{6}$/.test(pin)) {
      setErr("PIN must be exactly 6 digits.");
      return;
    }
    setBusy(true);
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      setErr("Supabase not configured.");
      setBusy(false);
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: pin,
    });
    if (error) {
      setErr(
        /invalid login/i.test(error.message)
          ? "Wrong PIN. If you've forgotten it, ask an admin to reset yours."
          : error.message
      );
    } else {
      window.location.href = safeNext;
    }
    setBusy(false);
  }

  async function createPin(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!/^\d{6}$/.test(pin)) {
      setErr("PIN must be exactly 6 digits.");
      return;
    }
    if (pin !== confirmPin) {
      setErr("PINs don't match.");
      return;
    }
    setBusy(true);
    const lower = email.trim().toLowerCase();
    try {
      const res = await fetch("/api/auth/bootstrap-pin", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: lower, pin }),
      });
      const body = await res.json();
      if (!res.ok || !body.ok) {
        setErr(body.error || "Could not set PIN.");
        setBusy(false);
        return;
      }
      // PIN created — now log in with it.
      const supabase = getSupabaseBrowser();
      if (!supabase) {
        setErr("Supabase not configured.");
        setBusy(false);
        return;
      }
      const { error } = await supabase.auth.signInWithPassword({
        email: lower,
        password: pin,
      });
      if (error) {
        setErr(`PIN set but sign-in failed: ${error.message}. Try signing in again.`);
        setBusy(false);
        return;
      }
      window.location.href = safeNext;
    } catch (ex) {
      setErr(String(ex));
    }
    setBusy(false);
  }

  function resetToEmail() {
    setStep("email");
    setPin("");
    setConfirmPin("");
    setErr(null);
  }

  const modeLabel = isAdminMode ? "Admin sign-in" : "Member sign-in";
  const heading =
    step === "email"
      ? isAdminMode
        ? "Admin login."
        : "Members sign-in."
      : step === "existing"
      ? `Welcome back${memberName ? `, ${memberName.split(" ")[0]}` : ""}.`
      : `First time here${memberName ? `, ${memberName.split(" ")[0]}` : ""}?`;

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 sm:py-16 md:py-24">
      <div className="rule-label flex items-center gap-3">
        <span className="inline-block h-px w-8 bg-[var(--color-cardinal)]" />
        {modeLabel}
      </div>
      <h1 className="mt-4 font-[family-name:var(--font-display)] text-[clamp(1.75rem,6vw,3rem)] leading-[1.1] font-medium">
        {heading}
      </h1>

      {configured === false && (
        <div className="mt-8 border border-[var(--color-cardinal)] bg-[var(--color-bone)] p-4 text-sm">
          <div className="rule-label text-[var(--color-cardinal)] mb-1">Setup pending</div>
          Authentication isn&apos;t fully configured yet. The Fund CTO will finish
          linking Supabase environment variables in Vercel.
        </div>
      )}

      {step === "email" && (
        <>
          <p className="mt-6 text-[var(--color-muted)] max-w-xl leading-relaxed break-words">
            Sign in with your USC Marshall email. First-time? You&apos;ll pick
            a 6-digit PIN on the next step. Returning? Enter your PIN.
          </p>
          <form onSubmit={checkEmail} className="mt-8 sm:mt-10 w-full max-w-lg space-y-4">
            <label className="block">
              <span className="rule-label mb-2 block">Marshall email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="YYYY@marshall.usc.edu"
                autoComplete="username"
                autoFocus
                className="w-full min-w-0 border hairline bg-[var(--color-paper)] px-3 py-3 font-mono text-[13px] sm:text-sm outline-none focus:border-[var(--color-cardinal)]"
              />
            </label>

            {err && <ErrorBox>{err}</ErrorBox>}

            <button
              type="submit"
              disabled={busy || configured === false}
              className="w-full sm:w-auto bg-[var(--color-cardinal)] text-[var(--color-paper)] px-6 py-3 text-xs uppercase font-mono hover:bg-[var(--color-cardinal-deep)] disabled:opacity-50"
            >
              {busy ? "Checking…" : "Continue →"}
            </button>

            <p className="pt-4 text-xs text-[var(--color-muted)] leading-relaxed break-words">
              Only emails on the Fund roster can sign in. If your email
              isn&apos;t recognized, ask an admin to add you.
            </p>
          </form>
        </>
      )}

      {step === "existing" && (
        <>
          <p className="mt-6 text-[var(--color-muted)] max-w-xl leading-relaxed break-words">
            Signing in as <span className="font-mono break-all text-[var(--color-ink)]">{email}</span>.
            Enter your 6-digit PIN.
          </p>
          <form onSubmit={signInExisting} className="mt-8 sm:mt-10 w-full max-w-lg space-y-4">
            <label className="block">
              <span className="rule-label mb-2 block">Your PIN</span>
              <input
                type="password"
                required
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                autoComplete="current-password"
                autoFocus
                placeholder="••••••"
                className="w-full sm:w-48 min-w-0 border hairline bg-[var(--color-paper)] px-3 py-3 font-mono tracking-[0.4em] text-center text-lg outline-none focus:border-[var(--color-cardinal)]"
              />
            </label>

            {err && <ErrorBox>{err}</ErrorBox>}

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={busy}
                className="bg-[var(--color-cardinal)] text-[var(--color-paper)] px-6 py-3 text-xs uppercase font-mono hover:bg-[var(--color-cardinal-deep)] disabled:opacity-50"
              >
                {busy ? "Signing in…" : "Sign in"}
              </button>
              <button
                type="button"
                onClick={resetToEmail}
                className="text-xs font-mono uppercase text-[var(--color-muted)] hover:text-[var(--color-cardinal)] border-b hairline pb-0.5"
              >
                Use a different email
              </button>
            </div>
          </form>
        </>
      )}

      {step === "new" && (
        <>
          <p className="mt-6 text-[var(--color-muted)] max-w-xl leading-relaxed break-words">
            We recognized <span className="font-mono break-all text-[var(--color-ink)]">{email}</span>.
            Pick a 6-digit PIN — you&apos;ll use it for every future login.
            Choose something you&apos;ll remember; you can change it any time
            from your profile.
          </p>
          <form onSubmit={createPin} className="mt-8 sm:mt-10 w-full max-w-lg space-y-4">
            <label className="block">
              <span className="rule-label mb-2 block">New 6-digit PIN</span>
              <input
                type="password"
                required
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                autoComplete="new-password"
                autoFocus
                placeholder="••••••"
                className="w-full sm:w-48 min-w-0 border hairline bg-[var(--color-paper)] px-3 py-3 font-mono tracking-[0.4em] text-center text-lg outline-none focus:border-[var(--color-cardinal)]"
              />
            </label>

            <label className="block">
              <span className="rule-label mb-2 block">Confirm PIN</span>
              <input
                type="password"
                required
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                autoComplete="new-password"
                placeholder="••••••"
                className="w-full sm:w-48 min-w-0 border hairline bg-[var(--color-paper)] px-3 py-3 font-mono tracking-[0.4em] text-center text-lg outline-none focus:border-[var(--color-cardinal)]"
              />
            </label>

            {err && <ErrorBox>{err}</ErrorBox>}

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={busy}
                className="bg-[var(--color-cardinal)] text-[var(--color-paper)] px-6 py-3 text-xs uppercase font-mono hover:bg-[var(--color-cardinal-deep)] disabled:opacity-50"
              >
                {busy ? "Setting up…" : "Create PIN & sign in"}
              </button>
              <button
                type="button"
                onClick={resetToEmail}
                className="text-xs font-mono uppercase text-[var(--color-muted)] hover:text-[var(--color-cardinal)] border-b hairline pb-0.5"
              >
                Use a different email
              </button>
            </div>

            <p className="pt-2 text-xs text-[var(--color-muted)] leading-relaxed">
              Pick something you won&apos;t forget. Avoid obvious PINs like
              <span className="font-mono"> 123456 </span> or your birth year.
            </p>
          </form>
        </>
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

function ErrorBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs text-[var(--color-negative)] font-mono uppercase border border-[var(--color-negative)] px-3 py-2">
      {children}
    </div>
  );
}
