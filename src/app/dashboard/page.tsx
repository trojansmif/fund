"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ProfileTab } from "@/components/profile-tab";
import { AdminTab } from "@/components/admin-tab";
import { PitchTab as PitchTabV2 } from "@/components/pitch-tab";
import { useSupabaseSession } from "@/lib/supabase/use-session";
import { PlaceholderBadge, PlaceholderBanner } from "@/components/placeholder-badge";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { UpcomingMeetings } from "@/components/upcoming-meetings";

type Tab = "home" | "messages" | "pitch" | "insights" | "resources" | "profile" | "admin";

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { profile } = useSupabaseSession();
  const isAdmin = !!profile?.is_admin;
  const [tab, setTab] = useState<Tab>("home");

  // Honor ?tab= on load; only allow "admin" if the user is actually admin
  useEffect(() => {
    const requested = params.get("tab");
    const validTabs: Tab[] = ["home", "messages", "pitch", "insights", "resources", "profile", "admin"];
    if (requested && (validTabs as string[]).includes(requested)) {
      if (requested === "admin" && !isAdmin) return; // silently fall through
      setTab(requested as Tab);
    }
  }, [params, isAdmin]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 md:py-12">
      <Header
        tab={tab}
        onTab={setTab}
        onExit={() => router.push("/")}
        isAdmin={isAdmin}
      />
      <div className="mt-8">
        {tab === "home" && <HomeTab onTab={setTab} />}
        {tab === "messages" && <MessagesTab />}
        {tab === "pitch" && <PitchTabV2 />}
        {tab === "insights" && <InsightsTab />}
        {tab === "resources" && <ResourcesTab />}
        {tab === "profile" && <ProfileTab />}
        {tab === "admin" && <AdminTab />}
      </div>
    </div>
  );
}

/* ───────────────────────── layout ───────────────────────── */

function Header({
  tab,
  onTab,
  onExit,
  isAdmin,
}: {
  tab: Tab;
  onTab: (t: Tab) => void;
  onExit: () => void;
  isAdmin: boolean;
}) {
  const tabs: { k: Tab; label: string }[] = [
    { k: "home", label: "Home" },
    { k: "messages", label: "Messages" },
    { k: "pitch", label: "Submit Pitch" },
    { k: "insights", label: "Insights" },
    { k: "resources", label: "Resources" },
    { k: "profile", label: "Profile" },
    ...(isAdmin ? [{ k: "admin" as Tab, label: "Admin" }] : []),
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
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      {/* Left column — pitch + quick links stacked */}
      <div className="col-span-12 md:col-span-7 space-y-4 md:space-y-6">
        <Card title="Investment pitch">
          <p className="text-sm text-[var(--color-muted)] leading-relaxed">
            Submit a new pitch to the Investment Committee. Approval requires 3
            of 5 Executive Committee votes; either Faculty Advisor can veto.
          </p>
          <button
            onClick={() => onTab("pitch")}
            className="mt-5 bg-[var(--color-cardinal)] text-[var(--color-paper)] px-4 py-2 text-xs uppercase font-mono hover:bg-[var(--color-cardinal-deep)]"
          >
            New pitch →
          </button>
        </Card>

        <Card title="Quick links">
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
      </div>

      {/* Right column — Upcoming meetings */}
      <div className="col-span-12 md:col-span-5">
        <Card title="Upcoming meetings">
          <UpcomingMeetings limit={6} />
        </Card>
      </div>

      {/* Announcements — full width, live from DB */}
      <Card title="Announcements" span="md:col-span-12">
        <LiveAnnouncements />
      </Card>
    </div>
  );
}

/* ───────────────────────── Messages tab ───────────────────────── */

function MessagesTab() {
  const [items, setItems] = useState<LiveAnn[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("ALL");

  useEffect(() => {
    (async () => {
      const sb = getSupabaseBrowser();
      if (!sb) {
        setLoading(false);
        return;
      }
      const { data, error } = await sb
        .from("announcements")
        .select("id, title, body, tag, pinned, created_at")
        .order("pinned", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) setErr(error.message);
      else setItems((data as LiveAnn[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const tags = useMemo(() => {
    const s = new Set<string>();
    items.forEach((i) => { if (i.tag) s.add(i.tag); });
    return ["ALL", ...Array.from(s).sort()];
  }, [items]);

  const visible = filter === "ALL" ? items : items.filter((i) => i.tag === filter);

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <Card title="Message board" span="md:col-span-12">
        {loading ? (
          <div className="text-sm text-[var(--color-muted)] font-mono uppercase">
            Loading…
          </div>
        ) : err ? (
          <div className="text-[12px] border border-[var(--color-negative)] text-[var(--color-negative)] px-3 py-2">
            {/relation.*does not exist|announcements.*schema cache/i.test(err)
              ? "Announcements table isn't set up yet — an admin needs to run 09_announcements.sql in Supabase."
              : err}
          </div>
        ) : items.length === 0 ? (
          <div className="text-sm text-[var(--color-muted)] leading-relaxed">
            No messages yet.
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2 mb-5">
              {tags.map((t) => {
                const active = filter === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setFilter(t)}
                    className={`text-[10px] font-mono uppercase px-3 py-1.5 transition-colors ${
                      active
                        ? "bg-[var(--color-cardinal)] text-[var(--color-paper)]"
                        : "border hairline hover:bg-[var(--color-bone)]"
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
              <span className="ml-auto text-[10px] font-mono uppercase text-[var(--color-muted)]">
                {visible.length} of {items.length}
              </span>
            </div>

            <ol className="space-y-4">
              {visible.map((a) => (
                <li
                  key={a.id}
                  className={`border hairline ${
                    a.pinned ? "bg-[var(--color-bone)]/50 border-[var(--color-cardinal)]" : "bg-[var(--color-paper)]"
                  }`}
                >
                  {a.pinned && (
                    <div className="h-[3px] w-full bg-[var(--color-cardinal)]" />
                  )}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="tag">{a.tag || "GENERAL"}</span>
                        {a.pinned && (
                          <span className="text-[10px] font-mono uppercase bg-[var(--color-cardinal)] text-[var(--color-paper)] px-2 py-0.5">
                            Pinned
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono uppercase text-[var(--color-muted)]">
                        {new Date(a.created_at).toLocaleString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <h3 className="mt-3 font-[family-name:var(--font-display)] text-xl md:text-2xl leading-tight">
                      {a.title}
                    </h3>
                    <p className="mt-3 text-[15px] leading-relaxed whitespace-pre-wrap text-[var(--color-ink)]/85">
                      {a.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </>
        )}
      </Card>
    </div>
  );
}

type LiveAnn = {
  id: string;
  title: string;
  body: string;
  tag: string | null;
  pinned: boolean;
  created_at: string;
};

function LiveAnnouncements() {
  const [items, setItems] = useState<LiveAnn[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const sb = getSupabaseBrowser();
      if (!sb) {
        setLoading(false);
        return;
      }
      const { data, error } = await sb
        .from("announcements")
        .select("id, title, body, tag, pinned, created_at")
        .order("pinned", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) setErr(error.message);
      else setItems((data as LiveAnn[]) ?? []);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return <div className="text-sm text-[var(--color-muted)] font-mono uppercase">Loading…</div>;
  }
  if (err) {
    const tableMissing = /relation.*does not exist|announcements.*schema cache/i.test(err);
    return (
      <div className="text-[12px] border border-[var(--color-negative)] text-[var(--color-negative)] px-3 py-2">
        {tableMissing
          ? "Announcements table isn't set up yet — an admin needs to run 09_announcements.sql in Supabase."
          : err}
      </div>
    );
  }
  if (items.length === 0) {
    return (
      <div className="text-sm text-[var(--color-muted)] leading-relaxed">
        No announcements yet.
      </div>
    );
  }

  return (
    <ul className="divide-y hairline">
      {items.map((a) => {
        const when = new Date(a.created_at).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        });
        return (
          <li key={a.id} className="py-3 grid grid-cols-12 gap-3 items-start">
            <div className="col-span-12 md:col-span-2 text-xs font-mono uppercase text-[var(--color-muted)]">
              {when}
              {a.pinned && (
                <div className="mt-1 inline-block text-[9px] bg-[var(--color-cardinal)] text-[var(--color-paper)] px-1.5 py-0.5">
                  PINNED
                </div>
              )}
            </div>
            <div className="col-span-12 md:col-span-8">
              <div className="font-[family-name:var(--font-display)] text-lg leading-tight">
                {a.title}
              </div>
              <div className="text-sm text-[var(--color-muted)] mt-1 whitespace-pre-wrap">
                {a.body}
              </div>
            </div>
            <div className="col-span-12 md:col-span-2 md:text-right">
              <span className="tag">{a.tag || "GENERAL"}</span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}


/* ───────────────────────── Insights tab ───────────────────────── */

function InsightsTab() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12">
        <PlaceholderBanner
          body="Fund snapshot, market pulse, and pipeline stats below are placeholder values. Connect the portfolio tracker and a market-data provider to flip these live."
        />
      </div>
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
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-[var(--color-rule)] border hairline">
      <Metric label="Pitches" value="—" />
      <Metric label="Approved" value="—" tone="positive" />
      <Metric label="Pending" value="—" />
      <Metric label="Streak" value="—" />
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

type LibraryDoc = {
  id: string;
  storage_path: string;
  display_name: string;
  mime_type: string | null;
  size_bytes: number | null;
  created_at: string;
};

function ResourcesTab() {
  const [docs, setDocs] = useState<LibraryDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const sb = getSupabaseBrowser();
      if (!sb) {
        setLoading(false);
        return;
      }
      const { data, error } = await sb
        .from("documents")
        .select("id, storage_path, display_name, mime_type, size_bytes, created_at")
        .order("created_at", { ascending: false });
      if (error) setErr(error.message);
      else setDocs((data as LibraryDoc[]) ?? []);
      setLoading(false);
    })();
  }, []);

  async function open(d: LibraryDoc) {
    const sb = getSupabaseBrowser();
    if (!sb) return;
    setBusyId(d.id);
    setErr(null);
    const { data, error } = await sb.storage
      .from("fund-docs")
      .createSignedUrl(d.storage_path, 3600);
    setBusyId(null);
    if (error || !data?.signedUrl) {
      setErr(error?.message || "Could not generate link.");
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener");
  }

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      {/* Fund Library — live from uploaded Documents */}
      <Card title={`Fund library · ${loading ? "…" : docs.length}`} span="md:col-span-12">
        {loading ? (
          <div className="text-sm text-[var(--color-muted)]">Loading documents…</div>
        ) : docs.length === 0 ? (
          <div className="text-sm text-[var(--color-muted)] leading-relaxed">
            No documents uploaded yet. Admins can upload from the Admin tab →
            Documents — they&apos;ll show up here for every signed-in member.
          </div>
        ) : (
          <ul className="divide-y hairline">
            {docs.map((d) => (
              <li key={d.id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-[family-name:var(--font-display)] text-base md:text-lg leading-tight truncate">
                    {d.display_name}
                  </div>
                  <div className="text-[11px] font-mono uppercase text-[var(--color-muted)]">
                    {friendlyKind(d.display_name, d.mime_type)} ·{" "}
                    {formatBytes(d.size_bytes)} ·{" "}
                    {new Date(d.created_at).toLocaleDateString()}
                  </div>
                </div>
                <button
                  onClick={() => open(d)}
                  disabled={busyId === d.id}
                  className="text-[11px] font-mono uppercase text-[var(--color-cardinal)] border-b border-[var(--color-cardinal)] pb-0.5 disabled:opacity-50 shrink-0"
                >
                  {busyId === d.id ? "…" : "Open ↗"}
                </button>
              </li>
            ))}
          </ul>
        )}
        {err && (
          <div className="mt-3 text-[11px] font-mono uppercase border border-[var(--color-negative)] text-[var(--color-negative)] px-3 py-2">
            {err}
          </div>
        )}
      </Card>

      {/* Shared drives (external links — unchanged) */}
      <Card title="Shared drives" span="md:col-span-6">
        <ul className="divide-y hairline">
          <ResourceRow title="SharePoint — SMIF Documents" subtitle="Primary document library" kind="SharePoint" href={process.env.NEXT_PUBLIC_SHAREPOINT_URL || "#"} />
          <ResourceRow title="OneDrive — Portfolio Tracker" subtitle="Live .xlsx workbook" kind="OneDrive" href={process.env.NEXT_PUBLIC_TRACKER_URL || "#"} />
          <ResourceRow title="Research archive" subtitle="Past memos & decks" kind="SharePoint" href={process.env.NEXT_PUBLIC_ARCHIVE_URL || "#"} />
        </ul>
      </Card>

      {/* Learning (static — curated copy) */}
      <Card title="Learning" span="md:col-span-6">
        <ul className="grid grid-cols-1 gap-px bg-[var(--color-rule)] border hairline">
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

function friendlyKind(name: string, mime: string | null): string {
  const ext = (name.split(".").pop() || "").toLowerCase();
  const map: Record<string, string> = {
    pdf: "PDF",
    docx: "Word",
    doc: "Word",
    xlsx: "Excel",
    xls: "Excel",
    pptx: "PowerPoint",
    ppt: "PowerPoint",
    png: "Image",
    jpg: "Image",
    jpeg: "Image",
    gif: "Image",
    webp: "Image",
    zip: "Archive",
    csv: "CSV",
    txt: "Text",
    md: "Markdown",
  };
  return map[ext] || (mime ? mime.split("/")[1]?.toUpperCase() || "File" : "File");
}

function formatBytes(n: number | null): string {
  if (!n || n <= 0) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let v = n;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(v >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
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
