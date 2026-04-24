"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSupabaseSession } from "@/lib/supabase/use-session";
import {
  computeUpside,
  listMyPitches,
  publicMemoUrl,
  STATUS_COPY,
  submitPitch,
  uploadPitchMemo,
  withdrawPitch,
  type Pitch,
} from "@/lib/pitch-store";

type FormState = {
  ticker: string;
  company: string;
  recommendation: "BUY" | "HOLD" | "SELL";
  entry_price: string;
  target_price: string;
  thesis: string;
  catalysts: string;
  risks: string;
  share_to_research: boolean;
};

const BLANK: FormState = {
  ticker: "",
  company: "",
  recommendation: "BUY",
  entry_price: "",
  target_price: "",
  thesis: "",
  catalysts: "",
  risks: "",
  share_to_research: false,
};

const MEMO_ACCEPT =
  ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv,.png,.jpg,.jpeg,.gif,.webp,.mp4,.mov,image/*,video/*,application/pdf";
const MEMO_MAX_BYTES = 25 * 1024 * 1024; // 25MB

export function PitchTab() {
  const { user, profile, loading } = useSupabaseSession();
  const [form, setForm] = useState<FormState>(BLANK);
  const [memoFile, setMemoFile] = useState<File | null>(null);
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [fetching, setFetching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const upside = useMemo(
    () =>
      computeUpside(
        parseFloat(form.entry_price) || null,
        parseFloat(form.target_price) || null
      ),
    [form.entry_price, form.target_price]
  );

  async function load() {
    if (!user) return;
    setFetching(true);
    setPitches(await listMyPitches(user.id));
    setFetching(false);
  }

  useEffect(() => {
    if (user) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (loading) return <Panel><div className="text-sm text-[var(--color-muted)]">Loading…</div></Panel>;

  if (!user || !profile) {
    return (
      <Panel>
        <Heading title="Sign in to submit pitches" />
        <p className="mt-3 text-sm text-[var(--color-muted)] leading-relaxed">
          Pitch submissions are tied to your Fund identity so the Investment
          Committee can vote. Sign in to unlock this tab.
        </p>
        <Link
          href="/sign-in?next=/dashboard"
          className="mt-5 inline-flex items-center gap-2 bg-[var(--color-cardinal)] text-[var(--color-paper)] px-5 py-3 text-xs uppercase font-mono hover:bg-[var(--color-cardinal-deep)]"
        >
          Sign in with Marshall email →
        </Link>
      </Panel>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile || !user) return;
    if (!form.ticker.trim() || !form.company.trim() || !form.thesis.trim()) {
      setMsg({ kind: "err", text: "Ticker, company, and thesis are required." });
      return;
    }
    if (memoFile && memoFile.size > MEMO_MAX_BYTES) {
      setMsg({ kind: "err", text: "Memo is larger than 25 MB." });
      return;
    }
    setSaving(true);
    setMsg(null);

    let memoPath: string | null = null;
    let memoFilename: string | null = null;
    if (memoFile) {
      const up = await uploadPitchMemo(memoFile, user.id);
      if (!up.ok) {
        setMsg({ kind: "err", text: `Memo upload failed: ${up.error}` });
        setSaving(false);
        return;
      }
      memoPath = up.path;
      memoFilename = up.filename;
    }

    const res = await submitPitch({
      memberId: profile.id,
      ticker: form.ticker,
      company: form.company,
      recommendation: form.recommendation,
      entry_price: parseFloat(form.entry_price) || null,
      target_price: parseFloat(form.target_price) || null,
      upside_pct: upside,
      thesis: form.thesis,
      catalysts: form.catalysts.trim() || null,
      risks: form.risks.trim() || null,
      memo_path: memoPath,
      memo_filename: memoFilename,
      share_to_research: form.share_to_research,
    });
    if (!res.ok) {
      setMsg({ kind: "err", text: res.error });
    } else {
      setMsg({ kind: "ok", text: `Submitted · ${res.pitch.ticker}` });
      setForm(BLANK);
      setMemoFile(null);
      await load();
    }
    setSaving(false);
  }

  async function doWithdraw(id: string) {
    if (!confirm("Withdraw this pitch? It'll no longer be visible to the Investment Committee.")) return;
    if (await withdrawPitch(id)) {
      setMsg({ kind: "ok", text: "Pitch withdrawn." });
      await load();
    } else {
      setMsg({ kind: "err", text: "Withdraw failed." });
    }
  }

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      {/* Submit form */}
      <Panel span="md:col-span-7" title="Submit a pitch to the Investment Committee">
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Ticker" required>
              <input
                className={inputCls}
                value={form.ticker}
                onChange={(e) => setForm({ ...form, ticker: e.target.value.toUpperCase() })}
                placeholder="e.g. CRM"
                required
              />
            </Field>
            <Field label="Recommendation">
              <select
                className={inputCls}
                value={form.recommendation}
                onChange={(e) => setForm({ ...form, recommendation: e.target.value as FormState["recommendation"] })}
              >
                <option>BUY</option>
                <option>HOLD</option>
                <option>SELL</option>
              </select>
            </Field>
          </div>
          <Field label="Company" required>
            <input
              className={inputCls}
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              placeholder="Salesforce, Inc."
              required
            />
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Entry $">
              <input
                className={inputCls}
                inputMode="decimal"
                value={form.entry_price}
                onChange={(e) => setForm({ ...form, entry_price: e.target.value })}
                placeholder="200"
              />
            </Field>
            <Field label="Target $">
              <input
                className={inputCls}
                inputMode="decimal"
                value={form.target_price}
                onChange={(e) => setForm({ ...form, target_price: e.target.value })}
                placeholder="240"
              />
            </Field>
            <Field label="Upside">
              <div
                className={`${inputCls} flex items-center pointer-events-none font-num ${
                  (upside ?? 0) >= 0 ? "text-[var(--color-positive)]" : "text-[var(--color-negative)]"
                }`}
              >
                {upside === null ? "—" : `${upside >= 0 ? "+" : ""}${upside.toFixed(2)}%`}
              </div>
            </Field>
          </div>
          <Field label="Thesis" required>
            <textarea
              className={`${inputCls} min-h-[96px]`}
              value={form.thesis}
              onChange={(e) => setForm({ ...form, thesis: e.target.value })}
              placeholder="Why now? What's the setup? Key evidence."
              required
            />
          </Field>
          <Field label="Catalysts">
            <textarea
              className={`${inputCls} min-h-[72px]`}
              value={form.catalysts}
              onChange={(e) => setForm({ ...form, catalysts: e.target.value })}
              placeholder="Events / dates that unlock the thesis"
            />
          </Field>
          <Field label="Risks">
            <textarea
              className={`${inputCls} min-h-[72px]`}
              value={form.risks}
              onChange={(e) => setForm({ ...form, risks: e.target.value })}
              placeholder="What could break this?"
            />
          </Field>

          <Field label="Attach memo or media">
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept={MEMO_ACCEPT}
                onChange={(e) => setMemoFile(e.target.files?.[0] ?? null)}
                className="block text-xs font-mono text-[var(--color-muted)] file:mr-3 file:py-2 file:px-3 file:border-0 file:bg-[var(--color-bone)] file:text-[var(--color-ink)] file:font-mono file:text-[10px] file:uppercase file:cursor-pointer hover:file:bg-[var(--color-cardinal)] hover:file:text-[var(--color-paper)]"
              />
              {memoFile && (
                <button
                  type="button"
                  onClick={() => setMemoFile(null)}
                  className="text-[10px] font-mono uppercase text-[var(--color-muted)] hover:text-[var(--color-negative)] border-b hairline pb-0.5"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="mt-1 text-[11px] font-mono text-[var(--color-muted)]">
              PDF, Word, slides, images or video · up to 25 MB
              {memoFile && ` · ${memoFile.name} · ${(memoFile.size / 1024 / 1024).toFixed(2)} MB`}
            </div>
          </Field>

          <label className="flex items-start gap-3 border hairline bg-[var(--color-bone)] px-3 py-3 cursor-pointer hover:border-[var(--color-cardinal)]">
            <input
              type="checkbox"
              checked={form.share_to_research}
              onChange={(e) => setForm({ ...form, share_to_research: e.target.checked })}
              className="mt-0.5 accent-[var(--color-cardinal)]"
            />
            <span className="min-w-0">
              <span className="block text-xs font-mono uppercase text-[var(--color-ink)] font-semibold">
                Post to Research tab repository
              </span>
              <span className="block mt-1 text-[11px] text-[var(--color-muted)] leading-snug">
                Shares this pitch + memo on the public Research pipeline so the
                Fund can reference it. You can still withdraw.
              </span>
            </span>
          </label>

          <button
            type="submit"
            disabled={saving}
            className="bg-[var(--color-cardinal)] text-[var(--color-paper)] px-5 py-3 text-xs uppercase font-mono hover:bg-[var(--color-cardinal-deep)] disabled:opacity-50"
          >
            {saving ? "Submitting…" : "Submit for IC vote"}
          </button>
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
          <p className="text-[11px] text-[var(--color-muted)] leading-relaxed">
            Once submitted, your pitch enters the IC queue. Approval requires
            3 of 5 Executive Committee votes; denial requires the same. Either
            Faculty Advisor may veto — that overrides any IC decision.
          </p>
        </form>
      </Panel>

      {/* My pitches */}
      <Panel
        span="md:col-span-5"
        title={`Your pitches · ${pitches.length}`}
        action={
          <button
            onClick={load}
            disabled={fetching}
            className="text-[10px] font-mono uppercase text-[var(--color-muted)] hover:text-[var(--color-cardinal)]"
          >
            {fetching ? "…" : "Refresh"}
          </button>
        }
      >
        {pitches.length === 0 ? (
          <div className="text-sm text-[var(--color-muted)]">Nothing yet. Submit your first pitch.</div>
        ) : (
          <ul className="divide-y hairline -m-1">
            {pitches.map((p) => {
              const tone = STATUS_COPY[p.status].tone;
              return (
                <li key={p.id} className="py-3 px-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-num font-medium">{p.ticker}</div>
                      <div className="text-[12px] text-[var(--color-muted)] truncate">{p.company}</div>
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
                  <div className="mt-1 text-[11px] font-mono uppercase text-[var(--color-muted)]">
                    {p.recommendation}
                    {p.upside_pct != null && ` · ${p.upside_pct >= 0 ? "+" : ""}${p.upside_pct.toFixed(1)}%`}
                    {" · "}
                    {new Date(p.created_at).toLocaleDateString()}
                  </div>
                  {(p.memo_path || p.share_to_research) && (
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {p.memo_path && (
                        <a
                          href={publicMemoUrl(p.memo_path) ?? "#"}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] font-mono uppercase text-[var(--color-cardinal)] border-b border-[var(--color-cardinal)] pb-0.5"
                        >
                          {p.memo_filename || "Memo"} ↗
                        </a>
                      )}
                      {p.share_to_research && (
                        <span className="text-[10px] font-mono uppercase text-[var(--color-ink)] bg-[var(--color-gold)] px-1.5 py-0.5">
                          Research
                        </span>
                      )}
                    </div>
                  )}
                  {p.status === "PITCHED" && (
                    <button
                      onClick={() => doWithdraw(p.id)}
                      className="mt-2 text-[10px] font-mono uppercase text-[var(--color-muted)] hover:text-[var(--color-negative)] border-b hairline pb-0.5"
                    >
                      Withdraw
                    </button>
                  )}
                  {p.status === "VETOED" && p.faculty_veto_reason && (
                    <div className="mt-2 text-[11px] text-[var(--color-negative)] italic leading-snug">
                      Veto reason: {p.faculty_veto_reason}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </div>
  );
}

/* ────────── primitives ────────── */

const inputCls =
  "w-full border hairline bg-[var(--color-paper)] px-3 py-2 font-mono text-sm outline-none focus:border-[var(--color-cardinal)]";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="rule-label mb-1.5 inline-flex items-center gap-1">
        {label}
        {required && <span className="text-[var(--color-cardinal)]">*</span>}
      </span>
      {children}
    </label>
  );
}

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
        <div className="px-4 md:px-5 py-3 border-b hairline bg-[var(--color-bone)] flex items-center justify-between">
          <div className="rule-label">{title}</div>
          {action}
        </div>
      )}
      <div className="px-4 md:px-5 py-4 md:py-5">{children}</div>
    </div>
  );
}

function Heading({ title }: { title: string }) {
  return <h2 className="font-[family-name:var(--font-display)] text-xl md:text-2xl leading-tight">{title}</h2>;
}
