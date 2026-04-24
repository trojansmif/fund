"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { publicMemoUrl, STATUS_COPY, type Pitch } from "@/lib/pitch-store";

type Row = Pitch & { author_name: string | null };

export function ResearchRepository() {
  const [rows, setRows] = useState<Row[] | null>(null);

  useEffect(() => {
    const sb = getSupabaseBrowser();
    if (!sb) { setRows([]); return; }
    (async () => {
      const { data } = await sb
        .from("pitches")
        .select("*, members:submitted_by_member_id (full_name)")
        .eq("share_to_research", true)
        .order("created_at", { ascending: false });
      const mapped: Row[] = (data ?? []).map((r: Pitch & { members: { full_name: string } | null }) => ({
        ...r,
        author_name: r.members?.full_name ?? null,
      }));
      setRows(mapped);
    })();
  }, []);

  if (rows === null) {
    return <div className="text-sm text-[var(--color-muted)]">Loading submitted pitches…</div>;
  }
  if (rows.length === 0) {
    return (
      <div className="text-sm text-[var(--color-muted)] border hairline bg-[var(--color-paper)] p-6">
        No member-submitted pitches yet. Analysts can share their pitch + memo
        to this repository from the Dashboard.
      </div>
    );
  }

  return (
    <ul className="divide-y hairline border hairline bg-[var(--color-paper)]">
      {rows.map((p) => {
        const memo = publicMemoUrl(p.memo_path);
        const tone = STATUS_COPY[p.status].tone;
        return (
          <li key={p.id} className="grid grid-cols-12 gap-4 p-5 md:p-6 items-center">
            <div className="col-span-12 md:col-span-6">
              <div className="flex items-center gap-3">
                <span className="font-num text-lg font-semibold">{p.ticker}</span>
                <span className="text-[10px] font-mono uppercase text-[var(--color-muted)]">
                  {p.recommendation}
                </span>
                {p.upside_pct != null && (
                  <span className={`text-[10px] font-mono ${p.upside_pct >= 0 ? "text-[var(--color-positive)]" : "text-[var(--color-negative)]"}`}>
                    {p.upside_pct >= 0 ? "+" : ""}{p.upside_pct.toFixed(1)}%
                  </span>
                )}
              </div>
              <div className="mt-1 font-[family-name:var(--font-display)] text-lg leading-tight">
                {p.company}
              </div>
              <div className="mt-2 text-[13px] text-[var(--color-ink)]/80 line-clamp-2">
                {p.thesis}
              </div>
            </div>
            <div className="col-span-6 md:col-span-3 text-[13px]">
              <div className="rule-label">Analyst</div>
              <div className="mt-1 text-[var(--color-ink)]/85">{p.author_name ?? "—"}</div>
              <div className="mt-1 font-mono text-[10px] text-[var(--color-muted)]">
                {new Date(p.created_at).toLocaleDateString()}
              </div>
            </div>
            <div className="col-span-6 md:col-span-3 flex flex-col md:items-end gap-2">
              <span
                className={`inline-block px-2 py-0.5 text-[10px] uppercase font-mono ${
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
              {memo && (
                <a
                  href={memo}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-mono uppercase text-[var(--color-cardinal)] border-b border-[var(--color-cardinal)] pb-0.5"
                >
                  {p.memo_filename || "Download memo"} ↗
                </a>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
