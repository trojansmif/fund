"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  addPitch,
  buildMailto,
  loadPitches,
  removePitch,
  submitPitch,
  type PitchRecord,
} from "@/lib/pitch-store";
import { ProfileTab } from "@/components/profile-tab";

type Tab = "home" | "pitch" | "insights" | "resources" | "profile";

export default function DashboardPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("home");

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 md:py-12">
      <Header
        tab={tab}
        onTab={setTab}
        onExit={() => router.push("/")}
      />
      <div className="mt-8">
        {tab === "home" && <HomeTab onTab={setTab} />}
        {tab === "pitch" && <PitchTab />}
        {tab === "insights" && <InsightsTab />}
        {tab === "resources" && <ResourcesTab />}
        {tab === "profile" && <ProfileTab />}
      </div>
    </div>
  );
}

/* ───────────────────────── layout ───────────────────────── */

function Header({
  tab,
  onTab,
  onExit,
}: {
  tab: Tab;
  onTab: (t: Tab) => void;
  onExit: () => void;
}) {
  const tabs: { k: Tab; label: string }[] = [
    { k: "home", label: "Today" },
    { k: "pitch", label: "Submit Pitch" },
    { k: "insights", label: "Insights" },
    { k: "resources", label: "Resources" },
    { k: "profile", label: "Profile" },
  ];
  return (
    <div>
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="rule-label flex items-center gap-3">
            <span className="inline-block h-px w-8 bg-[var(--color-cardinal)]" />
            Member Dashboard
          </div>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-[clamp(1.75rem,5vw,2.75rem)] font-medium leading-[1.1]">
            Welcome back to the Fund.
          </h1>
        </div>
        <button
          onClick={onExit}
          className="text-xs font-mono uppercase text-[var(--color-muted)] hover:text-[var(--color-cardinal)] border-b hairline pb-1"
        >
          Exit →
        </button>
      </div>

      <nav className="mt-6 overflow-x-auto">
        <div className="inline-flex border hairline min-w-full sm:min-w-0">
          {tabs.map((t) => {
            const active = t.k === tab;
            return (
              <button
                key={t.k}
                onClick={() => onTab(t.k)}
                className={`px-4 py-3 text-xs uppercase font-mono whitespace-nowrap border-r hairline last:border-r-0 transition-colors ${
                  active
                    ? "bg-[var(--color-cardinal)] text-[var(--color-paper)]"
                    : "bg-[var(--color-paper)] hover:bg-[var(--color-bone)]"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

/* ───────────────────────── Today tab ───────────────────────── */

function HomeTab({ onTab }: { onTab: (t: Tab) => void }) {
  const [pitches, setPitches] = useState<PitchRecord[]>([]);

  useEffect(() => {
    setPitches(loadPitches());
  }, []);

  const drafts = pitches.filter((p) => p.status === "DRAFT").length;
  const submitted = pitches.filter((p) => p.status === "SUBMITTED").length;

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      {/* Your pitches */}
      <Card title="Your pitches" span="md:col-span-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="font-num text-3xl text-[var(--color-cardinal)]">{drafts}</div>
            <div className="rule-label mt-1">Drafts</div>
          </div>
          <div>
            <div className="font-num text-3xl text-[var(--color-positive)]">{submitted}</div>
            <div className="rule-label mt-1">Sent</div>
          </div>
        </div>
        <button
          onClick={() => onTab("pitch")}
          className="mt-5 bg-[var(--color-cardinal)] text-[var(--color-paper)] px-4 py-2 text-xs uppercase font-mono hover:bg-[var(--color-cardinal-deep)]"
        >
          New pitch →
        </button>
      </Card>

      {/* Quick links */}
      <Card title="Quick links" span="md:col-span-6">
        <ul className="space-y-2 text-sm">
          <li>
            <Link href="/portfolio" className="flex items-center justify-between hover:text-[var(--color-cardinal)]">
              <span>Live portfolio</span>
              <span aria-hidden>→</span>
            </Link>
          </li>
          <li>
            <Link href="/research" className="flex items-center justify-between hover:text-[var(--color-cardinal)]">
              <span>Pipeline tracker</span>
              <span aria-hidden>→</span>
            </Link>
          </li>
          <li>
            <Link href="/leadership#roster" className="flex items-center justify-between hover:text-[var(--color-cardinal)]">
              <span>Member roster</span>
              <span aria-hidden>→</span>
            </Link>
          </li>
          <li>
            <button
              onClick={() => onTab("resources")}
              className="flex items-center justify-between w-full text-left hover:text-[var(--color-cardinal)]"
            >
              <span>Memo & valuation templates</span>
              <span aria-hidden>→</span>
            </button>
          </li>
        </ul>
      </Card>

      {/* Announcements */}
      <Card title="Announcements" span="md:col-span-12">
        <ul className="divide-y hairline">
          {ANNOUNCEMENTS.map((a) => (
            <li key={a.title} className="py-3 grid grid-cols-12 gap-3 items-start">
              <div className="col-span-12 md:col-span-2 text-xs font-mono uppercase text-[var(--color-muted)]">
                {a.date}
              </div>
              <div className="col-span-12 md:col-span-8">
                <div className="font-[family-name:var(--font-display)] text-lg">{a.title}</div>
                <div className="text-sm text-[var(--color-muted)] mt-0.5">{a.body}</div>
              </div>
              <div className="col-span-12 md:col-span-2 md:text-right">
                <span className="tag">{a.tag}</span>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

const ANNOUNCEMENTS = [
  { date: "2026-04-21", title: "Spring performance review", body: "Director-led walk-through of each sleeve before the summer cutoff.", tag: "REVIEW" },
  { date: "2026-04-18", title: "New pitch template", body: "Investment memo template v2 is live — check Resources.", tag: "RESOURCE" },
  { date: "2026-04-14", title: "CFA-OC SMIF competition", body: "Intent-to-compete forms due to the Director of Communications.", tag: "COMPETITION" },
];

/* ───────────────────────── Pitch tab ───────────────────────── */

function PitchTab() {
  const [pitches, setPitches] = useState<PitchRecord[]>([]);
  const [form, setForm] = useState({
    analyst: "",
    ticker: "",
    company: "",
    rec: "BUY" as "BUY" | "HOLD" | "SELL",
    entryPrice: "",
    targetPrice: "",
    thesis: "",
    catalysts: "",
    risks: "",
  });
  const [lastSaved, setLastSaved] = useState<PitchRecord | null>(null);

  useEffect(() => {
    setPitches(loadPitches());
  }, []);

  const upside = useMemo(() => {
    const e = parseFloat(form.entryPrice);
    const t = parseFloat(form.targetPrice);
    if (!Number.isFinite(e) || !Number.isFinite(t) || e === 0) return 0;
    return ((t - e) / e) * 100;
  }, [form.entryPrice, form.targetPrice]);

  function saveDraft(e: React.FormEvent) {
    e.preventDefault();
    if (!form.ticker || !form.company || !form.thesis) return;
    const rec = addPitch({
      analyst: form.analyst || "Analyst",
      ticker: form.ticker.toUpperCase(),
      company: form.company,
      rec: form.rec,
      entryPrice: parseFloat(form.entryPrice) || 0,
      targetPrice: parseFloat(form.targetPrice) || 0,
      upside,
      thesis: form.thesis,
      catalysts: form.catalysts,
      risks: form.risks,
      status: "DRAFT",
    });
    setPitches(loadPitches());
    setLastSaved(rec);
  }

  function emailAndMark(id: string) {
    submitPitch(id);
    setPitches(loadPitches());
  }

  function clearAll() {
    localStorage.removeItem("trojansmif.pitches");
    setPitches([]);
  }

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 lg:col-span-7">
        <Card title="New investment pitch">
          <form onSubmit={saveDraft} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Analyst">
                <input
                  className={inputCls}
                  value={form.analyst}
                  onChange={(e) => setForm({ ...form, analyst: e.target.value })}
                  placeholder="Your name"
                />
              </Field>
              <Field label="Recommendation">
                <select
                  className={inputCls}
                  value={form.rec}
                  onChange={(e) => setForm({ ...form, rec: e.target.value as typeof form.rec })}
                >
                  <option>BUY</option>
                  <option>HOLD</option>
                  <option>SELL</option>
                </select>
              </Field>
            </div>
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
              <Field label="Company" required>
                <input
                  className={inputCls}
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  placeholder="Salesforce, Inc."
                  required
                />
              </Field>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Entry $">
                <input
                  className={inputCls}
                  inputMode="decimal"
                  value={form.entryPrice}
                  onChange={(e) => setForm({ ...form, entryPrice: e.target.value })}
                  placeholder="200.00"
                />
              </Field>
              <Field label="Target $">
                <input
                  className={inputCls}
                  inputMode="decimal"
                  value={form.targetPrice}
                  onChange={(e) => setForm({ ...form, targetPrice: e.target.value })}
                  placeholder="240.00"
                />
              </Field>
              <Field label="Upside">
                <div
                  className={`${inputCls} flex items-center pointer-events-none font-num ${
                    upside >= 0 ? "text-[var(--color-positive)]" : "text-[var(--color-negative)]"
                  }`}
                >
                  {upside ? `${upside >= 0 ? "+" : ""}${upside.toFixed(2)}%` : "—"}
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

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                className="bg-[var(--color-cardinal)] text-[var(--color-paper)] px-5 py-3 text-xs uppercase font-mono hover:bg-[var(--color-cardinal-deep)]"
              >
                Save draft
              </button>
              {lastSaved && (
                <a
                  href={buildMailto(lastSaved)}
                  onClick={() => emailAndMark(lastSaved.id)}
                  className="inline-flex items-center gap-2 border border-[var(--color-ink)] px-5 py-3 text-xs uppercase font-mono hover:bg-[var(--color-bone)]"
                >
                  Email to CIO ↗
                </a>
              )}
            </div>
            {lastSaved && (
              <div className="text-[11px] font-mono text-[var(--color-positive)] uppercase">
                Draft saved — {new Date(lastSaved.createdAt).toLocaleTimeString()}
              </div>
            )}
          </form>
        </Card>
      </div>

      <div className="col-span-12 lg:col-span-5">
        <Card
          title="Your pitches"
          action={
            pitches.length > 0 ? (
              <button onClick={clearAll} className="text-[11px] font-mono uppercase text-[var(--color-muted)] hover:text-[var(--color-cardinal)]">
                Clear all
              </button>
            ) : null
          }
        >
          {pitches.length === 0 ? (
            <div className="text-sm text-[var(--color-muted)]">
              Your drafts and submissions show up here. Stored locally on this device.
            </div>
          ) : (
            <ul className="divide-y hairline -m-1">
              {pitches.map((p) => (
                <li key={p.id} className="py-3 grid grid-cols-12 gap-2">
                  <div className="col-span-2 font-num font-medium">{p.ticker}</div>
                  <div className="col-span-7">
                    <div className="text-sm">{p.company}</div>
                    <div className="text-[11px] text-[var(--color-muted)] font-mono uppercase">
                      {p.rec} · {p.upside >= 0 ? "+" : ""}
                      {p.upside.toFixed(1)}% · {new Date(p.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="col-span-3 flex items-start justify-end gap-2">
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 ${
                        p.status === "SUBMITTED"
                          ? "bg-[var(--color-positive)] text-white"
                          : "border hairline text-[var(--color-muted)]"
                      }`}
                    >
                      {p.status}
                    </span>
                    <a
                      href={buildMailto(p)}
                      onClick={() => emailAndMark(p.id)}
                      className="text-[10px] font-mono uppercase text-[var(--color-cardinal)] border-b border-[var(--color-cardinal)] pb-0.5"
                    >
                      Send
                    </a>
                    <button
                      onClick={() => {
                        removePitch(p.id);
                        setPitches(loadPitches());
                      }}
                      className="text-[10px] font-mono uppercase text-[var(--color-muted)] hover:text-[var(--color-cardinal)]"
                    >
                      ×
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-6 text-[10px] font-mono uppercase text-[var(--color-muted)]">
            Storage · local device only
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ───────────────────────── Insights tab ───────────────────────── */

function InsightsTab() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <Card title="Fund snapshot" span="md:col-span-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-[var(--color-rule)] border hairline">
          <Metric label="Net Asset Value" value="$127,348" />
          <Metric label="Since Inception" value="+27.35%" tone="positive" />
          <Metric label="Sharpe" value="2.41" />
          <Metric label="Max DD" value="−6.10%" tone="negative" />
        </div>
      </Card>

      <Card title="Market pulse" span="md:col-span-6">
        <ul className="divide-y hairline">
          {MARKET.map((m) => (
            <li key={m.label} className="flex items-center justify-between py-2.5">
              <div>
                <div className="font-num font-medium">{m.label}</div>
                <div className="text-[11px] font-mono uppercase text-[var(--color-muted)]">{m.subtitle}</div>
              </div>
              <div className="text-right">
                <div className="font-num">{m.value}</div>
                <div className={`font-num text-xs ${m.change >= 0 ? "text-[var(--color-positive)]" : "text-[var(--color-negative)]"}`}>
                  {m.change >= 0 ? "+" : ""}
                  {m.change.toFixed(2)}%
                </div>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-3 text-[10px] font-mono uppercase text-[var(--color-muted)]">
          Snapshot · replace with a live provider when the Fund has a data subscription
        </div>
      </Card>

      <Card title="Pitch pipeline" span="md:col-span-6">
        <ul className="divide-y hairline">
          {[
            { t: "CRM", c: "Salesforce", s: "PITCHED" },
            { t: "NFLX", c: "Netflix", s: "APPROVED" },
            { t: "SHOP", c: "Shopify", s: "RESEARCH" },
            { t: "F", c: "Ford Motor", s: "REJECTED" },
          ].map((p) => (
            <li key={p.t} className="flex items-center justify-between py-2.5">
              <div>
                <div className="font-num font-medium">{p.t}</div>
                <div className="text-[11px] text-[var(--color-muted)]">{p.c}</div>
              </div>
              <span className="text-[10px] font-mono uppercase border hairline px-2 py-0.5">{p.s}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Your stats" span="md:col-span-12">
        <YourStats />
      </Card>
    </div>
  );
}

function YourStats() {
  const [pitches, setPitches] = useState<PitchRecord[]>([]);
  useEffect(() => setPitches(loadPitches()), []);
  const total = pitches.length;
  const sent = pitches.filter((p) => p.status === "SUBMITTED").length;
  const avgUpside =
    pitches.length > 0
      ? pitches.reduce((a, b) => a + (b.upside || 0), 0) / pitches.length
      : 0;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-[var(--color-rule)] border hairline">
      <Metric label="Pitches drafted" value={String(total)} />
      <Metric label="Submitted" value={String(sent)} />
      <Metric
        label="Avg upside"
        value={`${avgUpside >= 0 ? "+" : ""}${avgUpside.toFixed(1)}%`}
        tone={avgUpside >= 0 ? "positive" : "negative"}
      />
      <Metric label="Streak" value={sent > 0 ? `${sent} 🔥` : "—"} />
    </div>
  );
}

const MARKET = [
  { label: "SPY", subtitle: "S&P 500 ETF", value: "$518.22", change: 0.34 },
  { label: "QQQ", subtitle: "Nasdaq 100 ETF", value: "$441.17", change: 0.62 },
  { label: "^VIX", subtitle: "Volatility Index", value: "14.12", change: -2.81 },
  { label: "^TNX", subtitle: "10Y Treasury", value: "4.18%", change: 0.05 },
  { label: "DXY", subtitle: "Dollar Index", value: "105.44", change: -0.11 },
  { label: "GLD", subtitle: "Gold ETF", value: "$231.56", change: 0.42 },
];

/* ───────────────────────── Resources tab ───────────────────────── */

function ResourcesTab() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <Card title="Templates" span="md:col-span-6">
        <ul className="divide-y hairline">
          <ResourceRow title="Investment Memo Template" subtitle="One-page pitch format" kind=".docx" href={process.env.NEXT_PUBLIC_MEMO_TEMPLATE_URL || "#"} />
          <ResourceRow title="Valuation Model Template" subtitle="DCF, multiples, scenario" kind=".xlsx" href={process.env.NEXT_PUBLIC_VALUATION_TEMPLATE_URL || "#"} />
          <ResourceRow title="Pitch Deck Template" subtitle="Investment Committee format" kind=".pptx" href={process.env.NEXT_PUBLIC_DECK_TEMPLATE_URL || "#"} />
          <ResourceRow title="Fund Handbook" subtitle="Bylaws + operating manual" kind=".pdf" href={process.env.NEXT_PUBLIC_HANDBOOK_URL || "#"} />
        </ul>
      </Card>

      <Card title="Shared drives" span="md:col-span-6">
        <ul className="divide-y hairline">
          <ResourceRow title="SharePoint — SMIF Documents" subtitle="Primary document library" kind="SharePoint" href={process.env.NEXT_PUBLIC_SHAREPOINT_URL || "#"} />
          <ResourceRow title="OneDrive — Portfolio Tracker" subtitle="Live .xlsx workbook" kind="OneDrive" href={process.env.NEXT_PUBLIC_TRACKER_URL || "#"} />
          <ResourceRow title="Research archive" subtitle="Past memos & decks" kind="SharePoint" href={process.env.NEXT_PUBLIC_ARCHIVE_URL || "#"} />
        </ul>
      </Card>

      <Card title="Learning" span="md:col-span-12">
        <ul className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[var(--color-rule)] border hairline">
          {LEARNING.map((l) => (
            <li key={l.title} className="bg-[var(--color-paper)] p-5">
              <div className="rule-label">{l.tag}</div>
              <div className="mt-2 font-[family-name:var(--font-display)] text-lg leading-tight">{l.title}</div>
              <p className="mt-2 text-sm text-[var(--color-muted)]">{l.body}</p>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function ResourceRow({ title, subtitle, kind, href }: { title: string; subtitle: string; kind: string; href: string }) {
  const real = href && href !== "#";
  return (
    <li className="py-3 flex items-center justify-between gap-3">
      <div>
        <div className="font-[family-name:var(--font-display)] text-base md:text-lg">{title}</div>
        <div className="text-[11px] text-[var(--color-muted)]">{subtitle}</div>
      </div>
      <div className="flex items-center gap-3">
        <span className="tag">{kind}</span>
        {real ? (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="text-[11px] font-mono uppercase text-[var(--color-cardinal)] border-b border-[var(--color-cardinal)] pb-0.5"
          >
            Open ↗
          </a>
        ) : (
          <span className="text-[11px] font-mono uppercase text-[var(--color-muted)]">Link pending</span>
        )}
      </div>
    </li>
  );
}

const LEARNING = [
  { tag: "01 · Modeling", title: "DCF from first principles", body: "A clean, student-friendly walk-through linked in the Knowledge Base." },
  { tag: "02 · Research", title: "Writing a tight thesis", body: "How to distill a long-form view into a one-page memo the IC will read." },
  { tag: "03 · Risk", title: "Position sizing under policy", body: "Working backwards from the 5% / 25% / 15% caps into portfolio weights." },
];

/* ───────────────────────── primitives ───────────────────────── */

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

function Card({
  title,
  children,
  span = "md:col-span-12",
  action,
}: {
  title: string;
  children: React.ReactNode;
  span?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className={`col-span-12 ${span} border hairline bg-[var(--color-paper)]`}>
      <div className="flex items-center justify-between px-4 md:px-5 py-3 border-b hairline bg-[var(--color-bone)]">
        <div className="rule-label">{title}</div>
        {action}
      </div>
      <div className="px-4 md:px-5 py-4 md:py-5">{children}</div>
    </div>
  );
}

function Metric({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "positive" | "negative";
}) {
  const tint =
    tone === "positive"
      ? "text-[var(--color-positive)]"
      : tone === "negative"
      ? "text-[var(--color-negative)]"
      : "text-[var(--color-ink)]";
  return (
    <div className="bg-[var(--color-paper)] p-4">
      <div className="rule-label">{label}</div>
      <div className={`mt-2 font-num text-xl md:text-2xl ${tint}`}>{value}</div>
    </div>
  );
}
