import Link from "next/link";
import { SectionLabel } from "@/components/section-label";
import { KPI } from "@/components/kpi";
import { PerfChart } from "@/components/perf-chart";
import { WeightBars } from "@/components/weight-bars";
import { Donut } from "@/components/donut";
import { WorldClocks } from "@/components/world-clocks";
import { LiveUpdated } from "@/components/live-updated";
import { ScrollHint } from "@/components/scroll-hint";
import { formatPct, formatUSD, POLICY_LIMITS } from "@/lib/portfolio";
import { loadSnapshot, sharepointUrl } from "@/lib/live-portfolio";

export const metadata = { title: "Portfolio — Live" };
export const revalidate = 900;

const assetColors: Record<string, string> = {
  "US Equity": "#990000",
  "International Equity": "#6e0000",
  "Fixed Income": "#b58a00",
  ETF: "#16161a",
  Alternatives: "#ffcc00",
  Cash: "#d4cfb8",
};

export default async function PortfolioPage() {
  const s = await loadSnapshot();
  const excess = s.sinceInception - 15.1;

  return (
    <>
      {/* Header strip */}
      <section className="border-b hairline">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-16 pb-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="rule-label flex items-center gap-3">
                <span className="inline-block h-px w-8 bg-[var(--color-cardinal)]" />
                Portfolio · Live Report
              </div>
              <h1 className="mt-4 font-[family-name:var(--font-display)] text-[clamp(2rem,6vw,3.75rem)] font-medium leading-[1.1]">
                USC SMIF · Live Book
              </h1>
              <div className="mt-5">
                <LiveUpdated asOf={s.asOf} />
              </div>
              <p className="mt-6 text-[var(--color-muted)] max-w-2xl leading-relaxed">
                Position, performance, and risk review synced from the SMIF
                Portfolio Tracker. Benchmark: SPY. Base currency: USD.
                Long-only. All activity paper-traded.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="/api/portfolio"
                className="inline-flex items-center gap-2 border border-[var(--color-ink)] px-5 py-2 text-xs uppercase hover:bg-[var(--color-bone)]"
              >
                JSON feed ↗
              </a>
              <a
                href={sharepointUrl()}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-[var(--color-cardinal)] text-[var(--color-paper)] px-5 py-2 text-xs uppercase hover:bg-[var(--color-cardinal-deep)]"
              >
                SharePoint docs ↗
              </a>
            </div>
          </div>
        </div>

        {/* World clocks */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pb-10">
          <div className="rule-label mb-3">Global market clocks</div>
          <WorldClocks />
        </div>

        {/* Headline KPIs */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pb-12 grid grid-cols-2 md:grid-cols-4 gap-px bg-[var(--color-rule)] border hairline">
          <LightKPI k="Net Asset Value" v={formatUSD(s.nav)} />
          <LightKPI
            k="Since Inception"
            v={formatPct(s.sinceInception)}
            sub={`vs SPY ${formatPct(excess)}`}
            tone="positive"
          />
          <LightKPI k="Sharpe Ratio" v={s.sharpe.toFixed(2)} sub={`Sortino ${s.sortino.toFixed(2)}`} />
          <LightKPI k="Max Drawdown" v={formatPct(s.maxDrawdown)} tone="negative" />
        </div>
      </section>

      {/* Performance */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12 md:py-16">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-9">
            <div className="border hairline p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="rule-label">Portfolio vs SPY</div>
                  <div className="mt-1 font-[family-name:var(--font-display)] text-2xl">
                    Indexed NAV · 100 at inception
                  </div>
                </div>
                <div className="hidden md:block text-xs text-[var(--color-muted)] font-mono">
                  {s.navSeries[0].date} → {s.navSeries[s.navSeries.length - 1].date}
                </div>
              </div>
              <PerfChart data={s.navSeries.filter((_, i) => i % 2 === 0)} height={300} />
            </div>
          </div>
          <div className="col-span-12 md:col-span-3 grid grid-cols-2 md:grid-cols-1 gap-3">
            <KPI label="Ann. Return" value={formatPct(s.annualizedReturn, false)} tone="positive" />
            <KPI label="Ann. Volatility" value={`${s.annualizedVol.toFixed(2)}%`} />
            <KPI label="Beta vs SPY" value={s.beta.toFixed(2)} />
            <KPI label="Alpha (ann.)" value={formatPct(s.alpha)} tone="positive" />
          </div>
        </div>
      </section>

      {/* Allocation */}
      <section className="border-y hairline bg-[var(--color-bone)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 md:py-16">
          <div className="grid grid-cols-12 gap-10">
            <div className="col-span-12 md:col-span-5">
              <SectionLabel eyebrow="Allocation" title="Asset class breakdown" />
              <p className="mt-4 text-[var(--color-muted)] max-w-md">
                Target bands per Fund policy. Cash remains above target while
                the Fund ramps its book in Year 1.
              </p>
              <div className="mt-8 max-w-xs">
                <Donut
                  data={s.assetAllocation
                    .filter((a) => a.weight > 0)
                    .map((a) => ({
                      label: a.class,
                      value: a.weight,
                      color: assetColors[a.class] ?? "#999",
                    }))}
                />
              </div>
            </div>
            <div className="col-span-12 md:col-span-7">
              <div className="border hairline bg-[var(--color-paper)] p-2 overflow-x-auto">
                <table className="w-full text-sm min-w-[440px]">
                  <thead>
                    <tr className="border-b hairline">
                      <th className="text-left p-4 rule-label">Asset class</th>
                      <th className="text-right p-4 rule-label">Weight</th>
                      <th className="text-right p-4 rule-label">Target band</th>
                      <th className="text-right p-4 rule-label">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y hairline">
                    {s.assetAllocation.map((a) => {
                      const inRange = a.weight >= a.target[0] && a.weight <= a.target[1];
                      return (
                        <tr key={a.class}>
                          <td className="p-4">
                            <span
                              className="inline-block w-2 h-2 mr-2 align-middle"
                              style={{ background: assetColors[a.class] ?? "#999" }}
                            />
                            {a.class}
                          </td>
                          <td className="p-4 text-right font-num">{a.weight.toFixed(2)}%</td>
                          <td className="p-4 text-right font-num text-[var(--color-muted)]">
                            {a.target[0]}–{a.target[1]}%
                          </td>
                          <td className="p-4 text-right">
                            <span
                              className={`inline-block px-2 py-0.5 text-[10px] font-mono uppercase  ${
                                inRange
                                  ? "bg-[var(--color-positive)] text-white"
                                  : "bg-[var(--color-gold)] text-[var(--color-ink)]"
                              }`}
                            >
                              {inRange ? "In band" : "Out of band"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sector */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12 md:py-16">
        <SectionLabel eyebrow="Sector exposure" title="GICS sector weights" />
        <div className="mt-8 grid grid-cols-12 gap-10">
          <div className="col-span-12 md:col-span-8">
            <WeightBars
              rows={s.sectors.map((x) => ({ label: x.sector, value: x.weight }))}
              max={POLICY_LIMITS.sectorCap}
            />
          </div>
          <div className="col-span-12 md:col-span-4">
            <div className="border hairline p-6">
              <div className="rule-label">Sector cap</div>
              <div className="mt-2 font-[family-name:var(--font-display)] text-4xl">
                {POLICY_LIMITS.sectorCap}%
              </div>
              <p className="mt-3 text-sm text-[var(--color-muted)]">
                No single GICS sector may exceed 25% of NAV. Breaches trigger
                Risk Management review within one business day.
              </p>
              <div className="mt-5">
                <div className="rule-label">Top sector</div>
                <div className="font-num mt-1">
                  {s.sectors[0].sector} · {s.sectors[0].weight.toFixed(2)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Holdings */}
      <section className="border-y hairline bg-[var(--color-bone)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 md:py-16">
          <div className="flex flex-wrap justify-between items-end gap-6 mb-6">
            <SectionLabel eyebrow="Holdings" title={`${s.positions} positions`} />
            <div className="text-xs font-mono uppercase  text-[var(--color-muted)]">
              Cost basis → market · thesis on record
            </div>
          </div>
          <ScrollHint />
          <div className="border hairline bg-[var(--color-paper)] overflow-x-auto">
            <table className="min-w-[720px] md:min-w-full text-sm">
              <thead className="bg-[var(--color-bone)] border-b hairline">
                <tr className="text-left">
                  <Th>Ticker</Th>
                  <Th>Name</Th>
                  <Th>Asset class</Th>
                  <Th>Sector</Th>
                  <Th align="right">Weight %</Th>
                  <Th align="right">P&L</Th>
                </tr>
              </thead>
              <tbody className="divide-y hairline">
                {s.holdings.map((h) => {
                  const neg = h.pnl < 0;
                  const warn = h.pnl <= -POLICY_LIMITS.stopLoss;
                  return (
                    <tr key={h.ticker} className="hover:bg-[var(--color-bone)]/60">
                      <Td>
                        <div className="font-num font-medium">{h.ticker}</div>
                      </Td>
                      <Td>
                        <div className="text-[13px]">{h.name}</div>
                        <div className="text-[11px] text-[var(--color-muted)] mt-0.5 line-clamp-1">
                          {h.thesis}
                        </div>
                      </Td>
                      <Td muted>{h.assetClass}</Td>
                      <Td muted>{h.sector}</Td>
                      <Td align="right" mono>
                        {h.weight.toFixed(2)}%
                      </Td>
                      <Td align="right">
                        <span
                          className={`font-num ${
                            neg ? "text-[var(--color-negative)]" : "text-[var(--color-positive)]"
                          }`}
                        >
                          {formatPct(h.pnl)}
                        </span>
                        {warn && (
                          <div className="font-mono text-[10px] text-[var(--color-negative)] uppercase ">
                            Stop-loss breach
                          </div>
                        )}
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Attribution */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12 md:py-16">
        <SectionLabel eyebrow="Attribution" title="Who moved the P&L." />
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <AttrPanel title="Top contributors" rows={s.topContributors} positive />
          <AttrPanel title="Top detractors" rows={s.topDetractors} />
        </div>
      </section>

      {/* Compliance */}
      <section className="border-y hairline">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 md:py-16">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <div className="rule-label">Compliance</div>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl md:text-5xl leading-tight font-medium">
                Policy limits, checked in real time.
              </h2>
            </div>
            <div className="flex items-center gap-4 font-mono text-xs uppercase">
              <span className="px-3 py-1 bg-[var(--color-positive)] text-white">Pass · 59</span>
              <span className="px-3 py-1 border border-[var(--color-cardinal)] text-[var(--color-cardinal)]">Warn · 2</span>
              <span className="px-3 py-1 border hairline text-[var(--color-muted)]">Fail · 0</span>
            </div>
          </div>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-5 gap-px bg-[var(--color-rule)] border hairline">
            {[
              { k: "Position cap", v: `${POLICY_LIMITS.positionCap}%` },
              { k: "Sector cap", v: `${POLICY_LIMITS.sectorCap}%` },
              { k: "Cash floor", v: `${POLICY_LIMITS.cashFloor}%` },
              { k: "Trade cap", v: `${POLICY_LIMITS.tradeCap}%` },
              { k: "Stop-loss", v: `${POLICY_LIMITS.stopLoss}%` },
            ].map((p) => (
              <div key={p.k} className="bg-[var(--color-paper)] p-5">
                <div className="rule-label">{p.k}</div>
                <div className="mt-2 font-num text-2xl text-[var(--color-cardinal)]">{p.v}</div>
              </div>
            ))}
          </div>
          <p className="mt-10 text-sm text-[var(--color-muted)] max-w-2xl leading-relaxed">
            Two stop-loss warnings open — NVDA and UNH. Under Risk Management
            review with the Investment Committee for either size reduction or
            thesis reaffirmation.
          </p>
        </div>
      </section>

      {/* Data source */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12 md:py-16">
        <div className="border hairline p-8 grid md:grid-cols-3 gap-8">
          <div>
            <div className="rule-label">Primary source</div>
            <div className="mt-2 font-[family-name:var(--font-display)] text-2xl">
              SMIF Portfolio Tracker
            </div>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              Internal Excel workbook, owned by Operations & Technology.
            </p>
          </div>
          <div>
            <div className="rule-label">Document library</div>
            <div className="mt-2 font-[family-name:var(--font-display)] text-2xl">
              Microsoft SharePoint
            </div>
            <a
              href={sharepointUrl()}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-2 text-sm text-[var(--color-cardinal)] underline underline-offset-4"
            >
              Open SharePoint ↗
            </a>
          </div>
          <div>
            <div className="rule-label">Feed</div>
            <div className="mt-2 font-[family-name:var(--font-display)] text-2xl">
              /api/portfolio
            </div>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              Cached 15 minutes. JSON snapshot consumed by this page and the
              public ticker.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

function LightKPI({
  k,
  v,
  sub,
  tone = "neutral",
}: {
  k: string;
  v: string;
  sub?: string;
  tone?: "neutral" | "positive" | "negative";
}) {
  const tint =
    tone === "positive"
      ? "text-[var(--color-positive)]"
      : tone === "negative"
      ? "text-[var(--color-negative)]"
      : "text-[var(--color-ink)]";
  return (
    <div className="bg-[var(--color-paper)] p-6">
      <div className="rule-label">{k}</div>
      <div className={`mt-3 font-num text-3xl md:text-4xl ${tint}`}>{v}</div>
      {sub && <div className="mt-1 font-num text-xs text-[var(--color-muted)]">{sub}</div>}
    </div>
  );
}

function AttrPanel({
  title,
  rows,
  positive,
}: {
  title: string;
  rows: { ticker: string; contribution: number }[];
  positive?: boolean;
}) {
  return (
    <div className="border hairline">
      <div className="px-6 py-4 border-b hairline flex items-center justify-between">
        <div className="rule-label">{title}</div>
        <span className={`font-mono text-[10px] uppercase  ${positive ? "text-[var(--color-positive)]" : "text-[var(--color-negative)]"}`}>
          {positive ? "Gainers" : "Losers"}
        </span>
      </div>
      <ul className="divide-y hairline">
        {rows.map((r) => (
          <li key={r.ticker} className="flex items-center justify-between px-6 py-3">
            <span className="font-num">{r.ticker}</span>
            <span
              className={`font-num ${
                r.contribution >= 0 ? "text-[var(--color-positive)]" : "text-[var(--color-negative)]"
              }`}
            >
              {formatPct(r.contribution)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Th({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "right" }) {
  return (
    <th
      className="px-4 py-3 font-mono text-[10px] uppercase  text-[var(--color-muted)]"
      style={{ textAlign: align }}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  mono,
  muted,
  align = "left",
}: {
  children: React.ReactNode;
  mono?: boolean;
  muted?: boolean;
  align?: "left" | "right";
}) {
  return (
    <td
      className={`px-4 py-3 align-top ${mono ? "font-num" : ""} ${muted ? "text-[var(--color-muted)]" : ""}`}
      style={{ textAlign: align }}
    >
      {children}
    </td>
  );
}
