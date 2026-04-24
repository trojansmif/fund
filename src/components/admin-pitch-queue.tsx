"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { useSupabaseSession } from "@/lib/supabase/use-session";
import {
  castVote,
  clearVote,
  listAllPitches,
  listVotesForPitch,
  STATUS_COPY,
  type Pitch,
  type PitchVote,
  type VoteDecision,
} from "@/lib/pitch-store";

type VoterInfo = {
  id: string;
  full_name: string;
  team: string;
  is_admin: boolean;
  auth_user_id: string | null;
};

export function AdminPitchQueue() {
  const { profile, user } = useSupabaseSession();
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [votesByPitch, setVotesByPitch] = useState<Record<string, PitchVote[]>>({});
  const [voters, setVoters] = useState<VoterInfo[]>([]);
  const [fetching, setFetching] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [vetoReason, setVetoReason] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<"PITCHED" | "ALL">("PITCHED");

  const isFaculty = profile?.team === "Faculty Advisors";
  const isExec = profile?.team === "Executive Committee";
  const canVote = isFaculty || isExec;

  const loadAll = useCallback(async () => {
    const sb = getSupabaseBrowser();
    if (!sb) return;
    setFetching(true);
    const [ps, vs] = await Promise.all([
      listAllPitches(),
      sb
        .from("members")
        .select("id, full_name, team, is_admin, auth_user_id")
        .in("team", ["Executive Committee", "Faculty Advisors"]),
    ]);
    setPitches(ps);
    setVoters(((vs.data as VoterInfo[]) ?? []).sort((a, b) => (a.team > b.team ? 1 : -1)));

    // Fetch votes per pitch in parallel
    const voteMap: Record<string, PitchVote[]> = {};
    await Promise.all(
      ps.map(async (p) => {
        voteMap[p.id] = await listVotesForPitch(p.id);
      })
    );
    setVotesByPitch(voteMap);
    setFetching(false);
  }, []);

  useEffect(() => {
    if (user && profile?.is_admin) loadAll();
  }, [user, profile?.is_admin, loadAll]);

  async function castOrClear(
    pitchId: string,
    decision: VoteDecision,
    note?: string
  ) {
    if (!profile) return;
    setBusy(`${pitchId}:${decision}`);
    setMsg(null);
    const myVote = votesByPitch[pitchId]?.find((v) => v.voter_member_id === profile.id);
    if (myVote && myVote.decision === decision) {
      await clearVote(pitchId, profile.id);
      setMsg({ kind: "ok", text: "Vote cleared." });
    } else {
      const res = await castVote({ pitchId, voterMemberId: profile.id, decision, note });
      if (!res.ok) setMsg({ kind: "err", text: res.error });
      else setMsg({ kind: "ok", text: `${decision} recorded.` });
    }
    // If veto with reason, persist reason on the pitch itself
    if (decision === "VETO" && note) {
      const sb = getSupabaseBrowser();
      if (sb) await sb.from("pitches").update({ faculty_veto_reason: note }).eq("id", pitchId);
    }
    await loadAll();
    setBusy(null);
  }

  const filtered = useMemo(
    () => (filter === "PITCHED" ? pitches.filter((p) => p.status === "PITCHED") : pitches),
    [pitches, filter]
  );

  if (!profile?.is_admin) {
    return (
      <Panel title="Investment Committee queue">
        <div className="text-sm text-[var(--color-muted)]">
          Admin-only. Grant yourself admin access from the Admin settings above.
        </div>
      </Panel>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <Panel
        span="md:col-span-12"
        title="Investment Committee queue"
        action={
          <div className="flex items-center gap-2">
            {(["PITCHED", "ALL"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-[10px] font-mono uppercase px-2 py-1 ${
                  filter === f
                    ? "bg-[var(--color-cardinal)] text-[var(--color-paper)]"
                    : "border hairline"
                }`}
              >
                {f === "PITCHED" ? "Pending" : "All"}
              </button>
            ))}
            <button
              onClick={loadAll}
              disabled={fetching}
              className="text-[10px] font-mono uppercase px-2 py-1 border hairline hover:bg-[var(--color-bone)]"
            >
              {fetching ? "…" : "Refresh"}
            </button>
          </div>
        }
      >
        {msg && (
          <div
            className={`mb-4 text-[11px] font-mono uppercase px-3 py-2 border ${
              msg.kind === "ok"
                ? "border-[var(--color-positive)] text-[var(--color-positive)]"
                : "border-[var(--color-negative)] text-[var(--color-negative)]"
            }`}
          >
            {msg.text}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="text-sm text-[var(--color-muted)]">
            {filter === "PITCHED" ? "No pitches awaiting a vote." : "No pitches submitted yet."}
          </div>
        ) : (
          <div className="space-y-5">
            {filtered.map((p) => {
              const votes = votesByPitch[p.id] ?? [];
              const execApprove = votes.filter(
                (v) => v.decision === "APPROVE" && voters.find((x) => x.id === v.voter_member_id)?.team === "Executive Committee"
              ).length;
              const execDeny = votes.filter(
                (v) => v.decision === "DENY" && voters.find((x) => x.id === v.voter_member_id)?.team === "Executive Committee"
              ).length;
              const facultyVeto = votes.find(
                (v) => v.decision === "VETO" && voters.find((x) => x.id === v.voter_member_id)?.team === "Faculty Advisors"
              );
              const myVote = profile ? votes.find((v) => v.voter_member_id === profile.id) : undefined;
              const submitter = voters.find((x) => x.id === p.submitted_by_member_id);
              const tone = STATUS_COPY[p.status].tone;

              return (
                <article key={p.id} className="border hairline">
                  <div className="px-4 md:px-5 py-3 border-b hairline bg-[var(--color-bone)]/60 flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-num text-base md:text-lg font-medium">{p.ticker}</span>
                        <span className="rule-label">{p.recommendation}</span>
                        {p.upside_pct != null && (
                          <span
                            className={`font-mono text-[10px] uppercase ${
                              p.upside_pct >= 0 ? "text-[var(--color-positive)]" : "text-[var(--color-negative)]"
                            }`}
                          >
                            {p.upside_pct >= 0 ? "+" : ""}
                            {p.upside_pct.toFixed(1)}%
                          </span>
                        )}
                      </div>
                      <div className="text-sm mt-0.5">{p.company}</div>
                      <div className="text-[11px] font-mono uppercase text-[var(--color-muted)] mt-1">
                        Submitted {new Date(p.created_at).toLocaleDateString()} ·{" "}
                        {p.submitted_by_member_id ? `by ${"member"}` : "unknown"}
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 ${
                        tone === "positive"
                          ? "bg-[var(--color-positive)] text-white"
                          : tone === "negative"
                          ? "bg-[var(--color-negative)] text-white"
                          : tone === "veto"
                          ? "bg-[var(--color-ink)] text-[var(--color-gold)]"
                          : tone === "warning"
                          ? "bg-[var(--color-rule)] text-[var(--color-muted)]"
                          : "border border-[var(--color-cardinal)] text-[var(--color-cardinal)]"
                      }`}
                    >
                      {STATUS_COPY[p.status].label}
                    </span>
                  </div>

                  <div className="px-4 md:px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {/* Content */}
                    <div className="space-y-3">
                      <Block label="Thesis" body={p.thesis} />
                      {p.catalysts && <Block label="Catalysts" body={p.catalysts} />}
                      {p.risks && <Block label="Risks" body={p.risks} />}
                      <div className="grid grid-cols-3 gap-3 text-[12px]">
                        <Kpi label="Entry" v={p.entry_price != null ? `$${p.entry_price}` : "—"} />
                        <Kpi label="Target" v={p.target_price != null ? `$${p.target_price}` : "—"} />
                        <Kpi label="Submitter" v={submitter?.full_name ?? "—"} />
                      </div>
                    </div>

                    {/* Votes + actions */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="rule-label">Votes</div>
                        <div className="text-[10px] font-mono uppercase text-[var(--color-muted)]">
                          {execApprove}/5 approve · {execDeny}/5 deny
                          {facultyVeto && " · faculty veto active"}
                        </div>
                      </div>
                      <div className="grid grid-cols-5 gap-0.5 mb-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div
                            key={i}
                            className={`h-2 ${
                              i < execApprove
                                ? "bg-[var(--color-positive)]"
                                : i < execApprove + execDeny
                                ? "bg-[var(--color-negative)]"
                                : "bg-[var(--color-rule)]"
                            }`}
                          />
                        ))}
                      </div>

                      <ul className="text-[11px] divide-y hairline border hairline">
                        {voters.map((v) => {
                          const vv = votes.find((x) => x.voter_member_id === v.id);
                          return (
                            <li key={v.id} className="px-3 py-2 flex items-center justify-between">
                              <div className="min-w-0">
                                <div className="truncate">{v.full_name}</div>
                                <div className="text-[10px] font-mono uppercase text-[var(--color-muted)]">{v.team}</div>
                              </div>
                              {vv ? (
                                <span
                                  className={`text-[10px] font-mono uppercase px-2 py-0.5 ${
                                    vv.decision === "APPROVE"
                                      ? "bg-[var(--color-positive)] text-white"
                                      : vv.decision === "DENY"
                                      ? "bg-[var(--color-negative)] text-white"
                                      : "bg-[var(--color-ink)] text-[var(--color-gold)]"
                                  }`}
                                >
                                  {vv.decision}
                                </span>
                              ) : (
                                <span className="text-[10px] font-mono uppercase text-[var(--color-muted)]">—</span>
                              )}
                            </li>
                          );
                        })}
                      </ul>

                      {canVote && p.status === "PITCHED" && (
                        <div className="mt-3 space-y-2">
                          <div className="flex flex-wrap gap-2">
                            <VoteBtn
                              label={myVote?.decision === "APPROVE" ? "Approved ✓" : "Approve"}
                              active={myVote?.decision === "APPROVE"}
                              tone="positive"
                              disabled={busy === `${p.id}:APPROVE`}
                              onClick={() => castOrClear(p.id, "APPROVE")}
                            />
                            <VoteBtn
                              label={myVote?.decision === "DENY" ? "Denied ✓" : "Deny"}
                              active={myVote?.decision === "DENY"}
                              tone="negative"
                              disabled={busy === `${p.id}:DENY`}
                              onClick={() => castOrClear(p.id, "DENY")}
                            />
                            {isFaculty && (
                              <VoteBtn
                                label={myVote?.decision === "VETO" ? "Vetoed ✓" : "Veto (faculty)"}
                                active={myVote?.decision === "VETO"}
                                tone="veto"
                                disabled={busy === `${p.id}:VETO`}
                                onClick={() => castOrClear(p.id, "VETO", vetoReason[p.id])}
                              />
                            )}
                          </div>
                          {isFaculty && (
                            <input
                              value={vetoReason[p.id] ?? ""}
                              onChange={(e) =>
                                setVetoReason({ ...vetoReason, [p.id]: e.target.value })
                              }
                              placeholder="Veto reason (optional, shown to submitter)"
                              className="w-full border hairline bg-[var(--color-paper)] px-3 py-2 font-mono text-[11px] outline-none focus:border-[var(--color-cardinal)]"
                            />
                          )}
                        </div>
                      )}
                      {facultyVeto && p.faculty_veto_reason && (
                        <div className="mt-3 text-[11px] italic text-[var(--color-negative)] leading-snug">
                          Veto note: {p.faculty_veto_reason}
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <p className="mt-4 text-[11px] text-[var(--color-muted)] leading-relaxed">
          Voting rules: Approval requires 3 Executive Committee approvals; denial
          requires 3 Executive Committee denials. Either Faculty Advisor may
          veto — overrides any IC outcome. Status is recomputed server-side on
          every vote, so totals and state are authoritative.
        </p>
      </Panel>
    </div>
  );
}

/* ────────── primitives ────────── */

function Panel({
  title,
  children,
  span = "md:col-span-12",
  action,
}: {
  title?: string;
  children: React.ReactNode;
  span?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className={`col-span-12 ${span} border hairline bg-[var(--color-paper)]`}>
      {title && (
        <div className="px-4 md:px-5 py-3 border-b hairline bg-[var(--color-bone)] flex items-center justify-between gap-3">
          <div className="rule-label">{title}</div>
          {action}
        </div>
      )}
      <div className="px-4 md:px-5 py-4 md:py-5">{children}</div>
    </div>
  );
}

function Block({ label, body }: { label: string; body: string }) {
  return (
    <div>
      <div className="rule-label">{label}</div>
      <p className="mt-1 text-sm leading-relaxed whitespace-pre-wrap">{body}</p>
    </div>
  );
}

function Kpi({ label, v }: { label: string; v: string }) {
  return (
    <div>
      <div className="rule-label">{label}</div>
      <div className="mt-0.5 font-num text-sm truncate">{v}</div>
    </div>
  );
}

function VoteBtn({
  label,
  active,
  tone,
  disabled,
  onClick,
}: {
  label: string;
  active?: boolean;
  tone: "positive" | "negative" | "veto";
  disabled?: boolean;
  onClick: () => void;
}) {
  const toneCls = active
    ? tone === "positive"
      ? "bg-[var(--color-positive)] text-white"
      : tone === "negative"
      ? "bg-[var(--color-negative)] text-white"
      : "bg-[var(--color-ink)] text-[var(--color-gold)]"
    : tone === "positive"
    ? "border border-[var(--color-positive)] text-[var(--color-positive)] hover:bg-[var(--color-positive)] hover:text-white"
    : tone === "negative"
    ? "border border-[var(--color-negative)] text-[var(--color-negative)] hover:bg-[var(--color-negative)] hover:text-white"
    : "border border-[var(--color-ink)] text-[var(--color-ink)] hover:bg-[var(--color-ink)] hover:text-[var(--color-gold)]";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`text-[11px] font-mono uppercase px-3 py-1.5 transition-colors disabled:opacity-50 ${toneCls}`}
    >
      {label}
    </button>
  );
}
