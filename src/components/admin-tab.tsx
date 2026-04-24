"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { useSupabaseSession, type MemberProfile } from "@/lib/supabase/use-session";
import { DocumentsManager } from "@/components/documents-manager";
import { AdminPitchQueue } from "@/components/admin-pitch-queue";
import { MeetingsAdmin } from "@/components/meetings-admin";
import { AnnouncementsAdmin } from "@/components/announcements-admin";

type Row = MemberProfile;

export function AdminTab() {
  const { loading, user, profile } = useSupabaseSession();
  const [rows, setRows] = useState<Row[]>([]);
  const [fetching, setFetching] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [revalidateBusy, setRevalidateBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [q, setQ] = useState("");

  const isAdmin = !!profile?.is_admin;

  async function load() {
    const sb = getSupabaseBrowser();
    if (!sb) return;
    setFetching(true);
    const { data, error } = await sb
      .from("members")
      .select("id, auth_user_id, username, full_name, team, role, linkedin_url, is_admin")
      .order("full_name", { ascending: true });
    if (error) {
      setMsg({ kind: "err", text: error.message });
    } else if (data) {
      setRows(data as Row[]);
    }
    setFetching(false);
  }

  useEffect(() => {
    if (isAdmin) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const filtered = useMemo(() => {
    if (!q.trim()) return rows;
    const needle = q.toLowerCase();
    return rows.filter(
      (r) =>
        r.full_name.toLowerCase().includes(needle) ||
        r.username.toLowerCase().includes(needle) ||
        r.team.toLowerCase().includes(needle) ||
        r.role.toLowerCase().includes(needle)
    );
  }, [rows, q]);

  const adminCount = rows.filter((r) => r.is_admin).length;
  const signedUpCount = rows.filter((r) => r.auth_user_id).length;

  if (loading) {
    return <Panel><div className="text-sm text-[var(--color-muted)]">Checking access…</div></Panel>;
  }

  if (!user) {
    return (
      <Panel>
        <Heading title="Admin only" />
        <p className="mt-3 text-sm text-[var(--color-muted)] leading-relaxed">
          Sign in to the Fund first. Admin settings are gated on your
          Supabase session.
        </p>
      </Panel>
    );
  }

  if (!isAdmin) {
    return (
      <Panel>
        <Heading title="Not authorized" />
        <p className="mt-3 text-sm text-[var(--color-muted)] leading-relaxed">
          This account isn't an admin. Ask an existing admin to grant access
          from their Admin tab.
        </p>
      </Panel>
    );
  }

  async function toggleAdmin(row: Row) {
    const sb = getSupabaseBrowser();
    if (!sb) return;
    setBusyId(row.id);
    setMsg(null);
    const { error } = await sb.from("members").update({ is_admin: !row.is_admin }).eq("id", row.id);
    if (error) {
      setMsg({ kind: "err", text: `${row.full_name}: ${error.message}` });
    } else {
      setMsg({
        kind: "ok",
        text: `${row.full_name} → ${!row.is_admin ? "admin" : "member"}`,
      });
      await load();
    }
    setBusyId(null);
  }

  async function setPin(row: Row) {
    const sb = getSupabaseBrowser();
    if (!sb) return;
    const pin = window.prompt(
      `Set a 6-digit PIN for ${row.full_name}.\n\nThey'll use it with their Marshall email to sign in.`,
      ""
    );
    if (pin === null) return; // cancelled
    if (!/^\d{6}$/.test(pin)) {
      setMsg({ kind: "err", text: "PIN must be exactly 6 digits." });
      return;
    }
    const email = `${row.username}@marshall.usc.edu`;
    setBusyId(row.id);
    setMsg(null);
    const { data: sessionData } = await sb.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) {
      setMsg({ kind: "err", text: "Your session expired — sign in again." });
      setBusyId(null);
      return;
    }
    try {
      const res = await fetch("/api/admin/set-pin", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email, pin }),
      });
      const body = await res.json();
      if (res.ok && body.ok) {
        setMsg({ kind: "ok", text: `PIN set for ${row.full_name}.` });
        await load();
      } else {
        setMsg({ kind: "err", text: body.error || "Failed to set PIN." });
      }
    } catch (e) {
      setMsg({ kind: "err", text: String(e) });
    }
    setBusyId(null);
  }

  async function revalidate(path: string) {
    setRevalidateBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/revalidate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ path }),
      });
      const body = await res.json();
      if (body.revalidated) {
        setMsg({
          kind: "ok",
          text: `Revalidated ${path} · ${new Date(body.at).toLocaleTimeString()}`,
        });
      } else {
        setMsg({ kind: "err", text: body.error || "Revalidate failed" });
      }
    } catch (e) {
      setMsg({ kind: "err", text: String(e) });
    } finally {
      setRevalidateBusy(false);
    }
  }

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      {/* Announcements — fastest broadcast channel, top of the page */}
      <div className="col-span-12">
        <div className="mb-2 rule-label">Broadcast to the Fund</div>
        <AnnouncementsAdmin />
      </div>

      {/* Pitch queue — most-used admin action after broadcast */}
      <div className="col-span-12">
        <div className="mt-4 md:mt-6 mb-2 rule-label">Pitch approval</div>
        <AdminPitchQueue />
      </div>

      {/* Meetings — calendar entries broadcast to every member's dashboard */}
      <div className="col-span-12">
        <div className="mt-4 md:mt-6 mb-2 rule-label">Meetings</div>
        <MeetingsAdmin />
      </div>

      {/* Documents — upload, share, broadcast to members */}
      <div className="col-span-12">
        <div className="mt-4 md:mt-6 mb-2 rule-label">Documents</div>
        <DocumentsManager />
      </div>

      {/* Summary */}
      <Panel span="md:col-span-12" title="Admin settings">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-5">
          <Stat label="Members" value={String(rows.length)} />
          <Stat label="Admins" value={String(adminCount)} tone="positive" />
          <Stat label="Signed up" value={String(signedUpCount)} />
          <Stat label="Pending" value={String(rows.length - signedUpCount)} tone="muted" />
        </div>
      </Panel>

      {/* Grant access */}
      <Panel span="md:col-span-12" title="Grant or revoke admin access">
        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, team, or role…"
            className="w-full md:w-80 border hairline bg-[var(--color-paper)] px-3 py-2 font-mono text-sm outline-none focus:border-[var(--color-cardinal)]"
          />
          <button
            onClick={load}
            disabled={fetching}
            className="text-xs font-mono uppercase px-3 py-2 border border-[var(--color-ink)] hover:bg-[var(--color-bone)] disabled:opacity-50"
          >
            {fetching ? "Loading…" : "Refresh"}
          </button>
          <div className="flex-1 text-right text-[11px] font-mono uppercase text-[var(--color-muted)]">
            Showing {filtered.length} of {rows.length}
          </div>
        </div>

        <div className="border hairline overflow-x-auto">
          <table className="min-w-[640px] w-full text-sm">
            <thead className="bg-[var(--color-bone)]">
              <tr>
                <Th>Member</Th>
                <Th>Team</Th>
                <Th>Role</Th>
                <Th>Signed up</Th>
                <Th align="right">Access</Th>
              </tr>
            </thead>
            <tbody className="divide-y hairline">
              {filtered.map((r) => {
                const isSelf = r.id === profile?.id;
                const disabled = busyId === r.id;
                return (
                  <tr key={r.id} className={r.is_admin ? "bg-[var(--color-bone)]/40" : ""}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-medium">{r.full_name}</div>
                      <div className="text-[10px] font-mono text-[var(--color-muted)] uppercase">
                        {r.username}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[var(--color-muted)] whitespace-nowrap">{r.team}</td>
                    <td className="px-4 py-3 text-[13px]">{r.role}</td>
                    <td className="px-4 py-3">
                      {r.auth_user_id ? (
                        <span className="font-mono text-[10px] uppercase px-2 py-0.5 bg-[var(--color-positive)] text-white">
                          Active
                        </span>
                      ) : (
                        <span className="font-mono text-[10px] uppercase px-2 py-0.5 border hairline text-[var(--color-muted)]">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-2 justify-end flex-wrap">
                        <button
                          disabled={disabled}
                          onClick={() => setPin(r)}
                          className="text-[10px] font-mono uppercase px-3 py-1.5 border border-[var(--color-ink)] hover:bg-[var(--color-bone)] disabled:opacity-50"
                        >
                          {disabled ? "…" : "Set PIN"}
                        </button>
                        <button
                          disabled={disabled || isSelf}
                          onClick={() => toggleAdmin(r)}
                          className={`text-[10px] font-mono uppercase px-3 py-1.5 transition-colors disabled:opacity-50 ${
                            r.is_admin
                              ? "bg-[var(--color-cardinal)] text-[var(--color-paper)] hover:bg-[var(--color-cardinal-deep)]"
                              : "border border-[var(--color-ink)] hover:bg-[var(--color-bone)]"
                          }`}
                          title={isSelf ? "You can't revoke your own access" : undefined}
                        >
                          {disabled ? "…" : r.is_admin ? "Admin · revoke" : "Grant admin"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && !fetching && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-[var(--color-muted)]">
                    No matches.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {msg && (
          <div
            className={`mt-4 text-[11px] font-mono px-3 py-2 border ${
              msg.kind === "ok"
                ? "border-[var(--color-positive)] text-[var(--color-positive)]"
                : "border-[var(--color-negative)] text-[var(--color-negative)]"
            }`}
          >
            {msg.text}
          </div>
        )}

        <p className="mt-4 text-[11px] text-[var(--color-muted)] leading-relaxed max-w-2xl">
          Admins can edit any member row and grant admin to others. You
          can't revoke your own admin — ask another admin to do that so the
          Fund always has at least one.
        </p>
      </Panel>


      {/* Site controls */}
      <Panel span="md:col-span-5" title="Site controls">
        <div className="space-y-3">
          <button
            disabled={revalidateBusy}
            onClick={() => revalidate("/portfolio")}
            className="w-full text-xs uppercase font-mono px-3 py-2 bg-[var(--color-cardinal)] text-[var(--color-paper)] hover:bg-[var(--color-cardinal-deep)] disabled:opacity-50"
          >
            Refresh /portfolio now
          </button>
          <button
            disabled={revalidateBusy}
            onClick={() => revalidate("/leadership")}
            className="w-full text-xs uppercase font-mono px-3 py-2 border border-[var(--color-ink)] hover:bg-[var(--color-bone)] disabled:opacity-50"
          >
            Refresh /leadership
          </button>
          <button
            disabled={revalidateBusy}
            onClick={() => revalidate("/")}
            className="w-full text-xs uppercase font-mono px-3 py-2 border border-[var(--color-ink)] hover:bg-[var(--color-bone)] disabled:opacity-50"
          >
            Refresh /
          </button>
        </div>
        <p className="mt-4 text-[11px] text-[var(--color-muted)] leading-relaxed">
          Forces an ISR revalidation so the next page view hits your
          latest Excel / Supabase state instead of the 15-minute cache.
        </p>
      </Panel>
    </div>
  );
}

/* ───────── primitives ───────── */

function Panel({
  title,
  children,
  span = "md:col-span-12",
}: {
  title?: string;
  children: React.ReactNode;
  span?: string;
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

function Heading({ title }: { title: string }) {
  return <h2 className="font-[family-name:var(--font-display)] text-xl md:text-2xl leading-tight">{title}</h2>;
}

function Stat({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "positive" | "muted";
}) {
  const tint =
    tone === "positive"
      ? "text-[var(--color-positive)]"
      : tone === "muted"
      ? "text-[var(--color-muted)]"
      : "text-[var(--color-ink)]";
  return (
    <div>
      <div className="rule-label">{label}</div>
      <div className={`mt-1 font-num text-2xl md:text-3xl ${tint}`}>{value}</div>
    </div>
  );
}

function Th({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "right" }) {
  return (
    <th
      className="px-4 py-3 font-mono text-[10px] uppercase text-[var(--color-muted)]"
      style={{ textAlign: align }}
    >
      {children}
    </th>
  );
}
