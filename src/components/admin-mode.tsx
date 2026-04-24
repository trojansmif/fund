"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { useSupabaseSession } from "@/lib/supabase/use-session";

const STORAGE_KEY = "trojansmif.admin.enabled";

export function AdminMode() {
  const { configured, loading, user, profile } = useSupabaseSession();
  const [enabled, setEnabled] = useState(false);
  const [open, setOpen] = useState(true);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  const isAdmin = !!profile?.is_admin;

  // Restore the "enabled" flag only if the user is actually an admin
  useEffect(() => {
    if (loading) return;
    try {
      const flag = localStorage.getItem(STORAGE_KEY) === "1";
      setEnabled(flag && isAdmin);
    } catch {}
  }, [loading, isAdmin]);

  // Hotkey: Ctrl/Cmd + Shift + U toggles admin mode (requires Supabase admin)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.shiftKey && (e.key === "U" || e.key === "u")) {
        e.preventDefault();
        if (!configured) {
          setMsg({ kind: "err", text: "Supabase not configured" });
          return;
        }
        if (!user) {
          router.push("/sign-in?next=/dashboard");
          return;
        }
        if (!isAdmin) {
          setMsg({ kind: "err", text: "This account isn't an admin." });
          return;
        }
        // Toggle panel
        if (enabled) {
          setEnabled(false);
          try {
            localStorage.removeItem(STORAGE_KEY);
          } catch {}
        } else {
          setEnabled(true);
          setOpen(true);
          try {
            localStorage.setItem(STORAGE_KEY, "1");
          } catch {}
        }
      }
      if (e.key === "Escape" && enabled) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [configured, user, isAdmin, enabled, router]);

  const loadSnapshot = useCallback(async () => {
    try {
      const res = await fetch("/api/portfolio", { cache: "no-store" });
      setData(await res.json());
    } catch (e) {
      setMsg({ kind: "err", text: `Snapshot fetch failed: ${String(e)}` });
    }
  }, []);

  useEffect(() => {
    if (enabled && open) loadSnapshot();
  }, [enabled, open, pathname, loadSnapshot]);

  async function revalidate(path: string) {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/revalidate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ path }),
      });
      const body = await res.json();
      if (body.revalidated) {
        setMsg({ kind: "ok", text: `Revalidated ${path} · ${new Date(body.at).toLocaleTimeString()}` });
        setTimeout(() => window.location.reload(), 400);
      } else {
        setMsg({ kind: "err", text: body.error || "Revalidate failed" });
      }
    } catch (e) {
      setMsg({ kind: "err", text: String(e) });
    } finally {
      setBusy(false);
    }
  }

  const summary = useMemo(() => {
    if (!data) return null;
    return {
      asOf: String(data.asOf ?? ""),
      nav: typeof data.nav === "number" ? data.nav : 0,
      positions: typeof data.positions === "number" ? data.positions : 0,
    };
  }, [data]);

  if (!enabled) {
    // Still show a transient error toast if a non-admin hits the hotkey
    return msg ? (
      <div className="fixed bottom-4 right-4 z-50 max-w-xs bg-[var(--color-paper)] border border-[var(--color-negative)] shadow-md">
        <div className="p-3 text-[11px] font-mono uppercase text-[var(--color-negative)]">
          {msg.text}
          <button
            onClick={() => setMsg(null)}
            className="ml-3 text-[var(--color-muted)] hover:text-[var(--color-ink)]"
          >
            ×
          </button>
        </div>
      </div>
    ) : null;
  }

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-[var(--color-cardinal)] text-[var(--color-paper)] text-xs uppercase font-mono px-3 py-2 border border-[var(--color-cardinal)] shadow-md hover:bg-[var(--color-cardinal-deep)]"
        >
          <span className="inline-block w-2 h-2 bg-[var(--color-gold)] rounded-full" />
          Admin
        </button>
      )}

      {open && (
        <div className="fixed bottom-4 right-4 z-50 w-[min(380px,calc(100vw-2rem))] bg-[var(--color-paper)] border hairline shadow-xl">
          <div className="flex items-center justify-between px-4 py-3 border-b hairline bg-[var(--color-bone)]">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-[var(--color-positive)] rounded-full animate-pulse" />
              <span className="font-mono text-[11px] uppercase">Admin · {profile?.username}</span>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-mono uppercase text-[var(--color-muted)]">
              <button onClick={() => setOpen(false)} className="hover:text-[var(--color-ink)]" aria-label="Collapse">
                —
              </button>
              <button
                onClick={() => {
                  setEnabled(false);
                  try {
                    localStorage.removeItem(STORAGE_KEY);
                  } catch {}
                }}
                className="hover:text-[var(--color-cardinal)]"
              >
                Hide
              </button>
            </div>
          </div>

          <div className="px-4 py-4 space-y-3 max-h-[60vh] overflow-y-auto">
            <div>
              <div className="text-[11px] font-mono uppercase text-[var(--color-muted)]">Current page</div>
              <div className="font-num text-sm">{pathname}</div>
            </div>

            {summary && (
              <>
                <div className="h-px bg-[var(--color-rule)]" />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-[11px] font-mono uppercase text-[var(--color-muted)]">NAV</div>
                    <div className="font-num text-sm">
                      {summary.nav ? `$${summary.nav.toLocaleString()}` : "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-mono uppercase text-[var(--color-muted)]">Positions</div>
                    <div className="font-num text-sm">{summary.positions || "—"}</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-mono uppercase text-[var(--color-muted)]">As of</div>
                    <div className="font-num text-sm">{summary.asOf || "—"}</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-mono uppercase text-[var(--color-muted)]">ISR</div>
                    <div className="font-num text-sm">15 min</div>
                  </div>
                </div>
              </>
            )}

            <div className="h-px bg-[var(--color-rule)]" />
            <div className="grid grid-cols-2 gap-2">
              <button
                disabled={busy}
                onClick={() => revalidate("/portfolio")}
                className="text-xs uppercase font-mono px-3 py-2 bg-[var(--color-cardinal)] text-[var(--color-paper)] hover:bg-[var(--color-cardinal-deep)] disabled:opacity-50"
              >
                Refresh /portfolio
              </button>
              <button
                disabled={busy}
                onClick={() => revalidate("/")}
                className="text-xs uppercase font-mono px-3 py-2 border border-[var(--color-ink)] hover:bg-[var(--color-bone)] disabled:opacity-50"
              >
                Refresh /
              </button>
            </div>

            <button
              onClick={async () => {
                const sb = getSupabaseBrowser();
                if (sb) await sb.auth.signOut();
                setEnabled(false);
                try {
                  localStorage.removeItem(STORAGE_KEY);
                } catch {}
              }}
              className="w-full text-xs uppercase font-mono px-3 py-2 border border-[var(--color-negative)] text-[var(--color-negative)] hover:bg-[var(--color-negative)] hover:text-white"
            >
              Sign out of Supabase
            </button>

            {msg && (
              <div
                className={`text-[11px] font-mono px-3 py-2 border ${
                  msg.kind === "ok"
                    ? "border-[var(--color-positive)] text-[var(--color-positive)]"
                    : "border-[var(--color-negative)] text-[var(--color-negative)]"
                }`}
              >
                {msg.text}
              </div>
            )}

            <div className="pt-2 text-[10px] font-mono uppercase text-[var(--color-muted)]">
              Hotkey · Ctrl/Cmd + Shift + U · Esc to collapse
            </div>
          </div>
        </div>
      )}
    </>
  );
}
