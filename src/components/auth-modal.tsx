"use client";

import { useEffect, useRef, useState } from "react";
import { checkPassword, setAuthed, type Role } from "@/lib/auth";

export function AuthModal({
  role,
  open,
  onClose,
  onSuccess,
}: {
  role: Role;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [value, setValue] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      setValue("");
      setErr(null);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (open && e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const title = role === "admin" ? "Admin Mode" : "Student Dashboard";
  const blurb =
    role === "admin"
      ? "Restricted to Fund officers. Enter the admin password to continue."
      : "Members-only access. Enter the student password to continue.";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (checkPassword(role, value)) {
      setAuthed(role, true);
      onSuccess();
    } else {
      setErr("Incorrect password");
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-[var(--color-ink)]/40 backdrop-blur-sm p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full sm:max-w-md bg-[var(--color-paper)] border hairline shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b hairline bg-[var(--color-bone)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-[var(--color-cardinal)] rounded-full" />
            <span className="font-mono text-[11px] uppercase">{title}</span>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--color-muted)] hover:text-[var(--color-ink)]"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={submit} className="px-5 py-6 space-y-4">
          <p className="text-sm text-[var(--color-muted)] leading-relaxed">{blurb}</p>

          <div>
            <label className="rule-label block mb-2" htmlFor="auth-password">
              Password
            </label>
            <input
              ref={inputRef}
              id="auth-password"
              type="password"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setErr(null);
              }}
              autoComplete="off"
              className="w-full border hairline bg-[var(--color-paper)] px-3 py-2 font-mono text-sm outline-none focus:border-[var(--color-cardinal)]"
              placeholder="••••••••"
            />
            {err && (
              <div className="mt-2 text-xs text-[var(--color-negative)] font-mono uppercase">
                {err}
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 bg-[var(--color-cardinal)] text-[var(--color-paper)] px-4 py-3 text-xs uppercase font-mono hover:bg-[var(--color-cardinal-deep)]"
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={onClose}
              className="border border-[var(--color-ink)] px-4 py-3 text-xs uppercase font-mono hover:bg-[var(--color-bone)]"
            >
              Cancel
            </button>
          </div>

          <div className="pt-2 text-[10px] font-mono uppercase text-[var(--color-muted)]">
            {role === "admin"
              ? "Hotkey · Ctrl / Cmd + Shift + U"
              : "Hotkey · Ctrl / Cmd + Shift + S"}
          </div>
        </form>
      </div>
    </div>
  );
}
