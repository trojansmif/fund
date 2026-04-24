import Image from "next/image";
import { formatPct, formatUSD, POLICY_LIMITS } from "@/lib/portfolio";
import { loadSnapshot } from "@/lib/live-portfolio";
import { PrintButton } from "@/components/print-button";

export const metadata = { title: "Portfolio Report" };

export default async function PortfolioReportPage(
  { searchParams }: { searchParams: Promise<{ date?: string }> }
) {
  const { date } = await searchParams;
  const s = await loadSnapshot();
  const asOf = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : s.asOf;

  // Filter the NAV series up to the selected date to make the chart honest.
  // Numbers (NAV, sharpe, etc.) stay at the most recent snapshot because
  // historical snapshots aren't wired yet — when they are, we can swap this
  // to a date-indexed fetch.
  const series = s.navSeries.filter((p) => p.date <= asOf);
  const cut = series.length > 0 ? series[series.length - 1] : s.navSeries[s.navSeries.length - 1];
  const sinceInception = cut ? cut.nav - 100 : s.sinceInception;
  const spyInception = cut ? cut.benchmark - 100 : 15.1;
  const excess = sinceInception - spyInception;

  const reportTitle = `Portfolio Report as of ${formatDate(asOf)}`;

  return (
    <div className="report min-h-screen bg-white text-[#0a0a0b]">
      <style>{printStyles}</style>

      {/* Toolbar — hidden when printing */}
      <div className="report-toolbar bg-[#f7f5ef] border-b border-black/10 px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="text-[11px] font-mono uppercase tracking-wider text-black/70">
          Trojan SMIF · Portfolio report · {formatDate(asOf)}
        </div>
        <div className="flex items-center gap-2">
          <PrintButton />
          <a href="/portfolio" className="text-[11px] font-mono uppercase border border-black/40 px-3 py-1.5 hover:bg-black/5">
            Back to live portfolio
          </a>
        </div>
      </div>

      <div className="report-page mx-auto max-w-[8.5in] px-10 py-10">
        {/* Header */}
        <header className="flex items-start justify-between gap-6 pb-6 border-b-2 border-[#990000]">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#990000]">
              Portfolio · Position Review
            </div>
            <h1 className="mt-2 text-3xl font-semibold leading-tight" style={{ fontFamily: "var(--font-display)" }}>
              {reportTitle}
            </h1>
            <div className="mt-2 text-[12px] text-black/70">
              Trojan Student Managed Investment Fund · USC Marshall School of Business
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right leading-tight">
              <div className="text-[11px] font-mono uppercase tracking-wider">
                Trojan SMIF
              </div>
              <div className="text-[9px] font-mono uppercase tracking-wider text-black/60">
                USC Marshall · MSF
              </div>
            </div>
            <Image
              src="/usc-seal.png"
              alt="USC Seal"
              width={56}
              height={56}
              className="h-14 w-14 object-contain"
              priority
            />
          </div>
        </header>

        {/* Executive summary */}
        <section className="mt-8">
          <SectionHeader>Executive Summary</SectionHeader>
          <div className="mt-4 grid grid-cols-4 gap-px bg-black/10 border border-black/10">
            <Stat label="Net Asset Value" value={formatUSD(s.nav)} />
            <Stat label="Since Inception" value={formatPct(sinceInception)} tone="pos" />
            <Stat label="Excess vs SPY" value={formatPct(excess)} tone={excess >= 0 ? "pos" : "neg"} />
            <Stat label="Positions" value={String(s.positions)} />
            <Stat label="Cash" value={formatUSD(s.cash)} />
            <Stat label="Invested" value={formatUSD(s.invested)} />
            <Stat label="Sharpe" value={s.sharpe.toFixed(2)} />
            <Stat label="Max Drawdown" value={formatPct(s.maxDrawdown)} tone="neg" />
          </div>
          <p className="mt-4 text-[13px] leading-relaxed text-black/75 max-w-[6in]">
            Long-only, multi-asset portfolio benchmarked to SPY. Paper-traded from
            the SMIF Portfolio Tracker. Figures shown as of {formatDate(asOf)}.
          </p>
        </section>

        {/* Performance */}
        <section className="mt-8 break-inside-avoid">
          <SectionHeader>Performance (Indexed to 100)</SectionHeader>
          <div className="mt-4">
            <PerfSvg series={series.length ? series : s.navSeries} />
          </div>
          <div className="mt-4 grid grid-cols-6 gap-px bg-black/10 border border-black/10">
            <Stat label="Ann. Return" value={formatPct(s.annualizedReturn)} tone="pos" />
            <Stat label="Ann. Vol." value={`${s.annualizedVol.toFixed(2)}%`} />
            <Stat label="Beta" value={s.beta.toFixed(2)} />
            <Stat label="Alpha" value={formatPct(s.alpha)} tone="pos" />
            <Stat label="Info Ratio" value={s.informationRatio.toFixed(2)} />
            <Stat label="Tracking Err." value={`${s.trackingError.toFixed(2)}%`} />
          </div>
        </section>

        {/* Asset allocation */}
        <section className="mt-8 break-inside-avoid">
          <SectionHeader>Asset Allocation</SectionHeader>
          <table className="mt-4 w-full text-[12px] border-collapse">
            <thead>
              <tr className="border-b border-black/30">
                <Th>Class</Th>
                <Th align="right">Weight</Th>
                <Th align="right">Target Low</Th>
                <Th align="right">Target High</Th>
                <Th align="right">Status</Th>
              </tr>
            </thead>
            <tbody>
              {s.assetAllocation.map((a) => {
                const [lo, hi] = a.target;
                const inRange = a.weight >= lo && a.weight <= hi;
                return (
                  <tr key={a.class} className="border-b border-black/10">
                    <Td>{a.class}</Td>
                    <Td align="right" mono>{a.weight.toFixed(2)}%</Td>
                    <Td align="right" mono muted>{lo.toFixed(0)}%</Td>
                    <Td align="right" mono muted>{hi.toFixed(0)}%</Td>
                    <Td align="right" mono tone={inRange ? "pos" : "neg"}>{inRange ? "In range" : "Off target"}</Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        {/* Sector weights */}
        <section className="mt-8 break-inside-avoid">
          <SectionHeader>Sector Weights</SectionHeader>
          <table className="mt-4 w-full text-[12px] border-collapse">
            <thead>
              <tr className="border-b border-black/30">
                <Th>Sector</Th>
                <Th align="right">Weight</Th>
              </tr>
            </thead>
            <tbody>
              {s.sectors.map((r) => (
                <tr key={r.sector} className="border-b border-black/10">
                  <Td>{r.sector}</Td>
                  <Td align="right" mono>{r.weight.toFixed(2)}%</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Holdings */}
        <section className="mt-8 break-before-page">
          <SectionHeader>Holdings</SectionHeader>
          <table className="mt-4 w-full text-[11px] border-collapse">
            <thead>
              <tr className="border-b border-black/30 bg-black/5">
                <Th>Ticker</Th>
                <Th>Name</Th>
                <Th>Class</Th>
                <Th>Sector</Th>
                <Th align="right">Weight</Th>
                <Th align="right">P&L (bps)</Th>
              </tr>
            </thead>
            <tbody>
              {s.holdings.map((h) => (
                <tr key={h.ticker} className="border-b border-black/10">
                  <Td mono>{h.ticker}</Td>
                  <Td>{h.name}</Td>
                  <Td muted>{h.assetClass}</Td>
                  <Td muted>{h.sector}</Td>
                  <Td align="right" mono>{h.weight.toFixed(2)}%</Td>
                  <Td align="right" mono tone={h.pnl >= 0 ? "pos" : "neg"}>
                    {h.pnl >= 0 ? "+" : ""}{h.pnl.toFixed(0)}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Top contributors */}
        <section className="mt-8 break-inside-avoid">
          <SectionHeader>Top Contributors (bps vs SPY)</SectionHeader>
          <table className="mt-4 w-full text-[12px] border-collapse">
            <thead>
              <tr className="border-b border-black/30">
                <Th>Ticker</Th>
                <Th align="right">Contribution</Th>
              </tr>
            </thead>
            <tbody>
              {s.topContributors.map((t) => (
                <tr key={t.ticker} className="border-b border-black/10">
                  <Td mono>{t.ticker}</Td>
                  <Td align="right" mono tone={t.contribution >= 0 ? "pos" : "neg"}>
                    {t.contribution >= 0 ? "+" : ""}{t.contribution.toFixed(2)}%
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Risk policy */}
        <section className="mt-8 break-inside-avoid">
          <SectionHeader>Risk Policy — Hard Limits</SectionHeader>
          <table className="mt-4 w-full text-[12px] border-collapse">
            <thead>
              <tr className="border-b border-black/30">
                <Th>Limit</Th>
                <Th align="right">Value</Th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: "Position cap", value: `${POLICY_LIMITS.positionCap}% of NAV` },
                { label: "Sector cap", value: `${POLICY_LIMITS.sectorCap}% of NAV` },
                { label: "Single trade cap", value: `${POLICY_LIMITS.tradeCap}% of NAV` },
                { label: "Cash floor", value: `${POLICY_LIMITS.cashFloor}% minimum` },
                { label: "Stop-loss alert", value: `−${POLICY_LIMITS.stopLoss}% position` },
              ].map((p) => (
                <tr key={p.label} className="border-b border-black/10">
                  <Td>{p.label}</Td>
                  <Td align="right" mono>{p.value}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t-2 border-[#990000] text-[10px] text-black/60 leading-relaxed">
          <div className="font-mono uppercase tracking-wider mb-2">Disclosures</div>
          <p className="max-w-[6.5in]">
            Trojan SMIF is a student-run investment organization at the USC
            Marshall School of Business. All trades are paper-traded against
            the S&amp;P 500 for educational purposes. Figures in this report
            may reflect placeholder data until the SMIF Portfolio Tracker is
            connected to the live feed. Nothing herein is investment advice
            or a solicitation to transact in any security.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono uppercase">
            <span>trojansmif.com / portfolio</span>
            <span>Generated {formatDate(new Date().toISOString().slice(0, 10))}</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="inline-block h-px w-8 bg-[#990000]" />
      <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#990000]">
        {children}
      </span>
    </div>
  );
}

function Stat({ label, value, tone = "neutral" }: { label: string; value: string; tone?: "neutral" | "pos" | "neg" }) {
  const color = tone === "pos" ? "#2f5d3a" : tone === "neg" ? "#8a1c1c" : "#0a0a0b";
  return (
    <div className="bg-white p-4">
      <div className="text-[9px] font-mono uppercase tracking-wider text-black/60">{label}</div>
      <div className="mt-1.5 text-xl font-semibold" style={{ color, fontFamily: "var(--font-display)" }}>{value}</div>
    </div>
  );
}

function Th({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "right" }) {
  return (
    <th
      className="px-3 py-2 font-mono text-[9px] uppercase tracking-wider text-black/60"
      style={{ textAlign: align }}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  align = "left",
  mono,
  muted,
  tone,
}: {
  children: React.ReactNode;
  align?: "left" | "right";
  mono?: boolean;
  muted?: boolean;
  tone?: "pos" | "neg";
}) {
  const color = tone === "pos" ? "#2f5d3a" : tone === "neg" ? "#8a1c1c" : undefined;
  return (
    <td
      className={`px-3 py-2 ${mono ? "font-mono tabular-nums" : ""} ${muted ? "text-black/60" : ""}`}
      style={{ textAlign: align, color }}
    >
      {children}
    </td>
  );
}

function PerfSvg({ series }: { series: { date: string; nav: number; benchmark: number }[] }) {
  if (series.length === 0) {
    return <div className="text-[12px] text-black/60">No data points.</div>;
  }
  const W = 800;
  const H = 240;
  const pad = { t: 12, r: 12, b: 28, l: 36 };
  const all = [...series.map((p) => p.nav), ...series.map((p) => p.benchmark)];
  const minY = Math.floor(Math.min(...all) / 5) * 5;
  const maxY = Math.ceil(Math.max(...all) / 5) * 5;
  const xFor = (i: number) => pad.l + (i / Math.max(1, series.length - 1)) * (W - pad.l - pad.r);
  const yFor = (v: number) => pad.t + (1 - (v - minY) / Math.max(1e-6, maxY - minY)) * (H - pad.t - pad.b);
  const navPath = series.map((p, i) => `${i === 0 ? "M" : "L"}${xFor(i).toFixed(1)} ${yFor(p.nav).toFixed(1)}`).join(" ");
  const benchPath = series.map((p, i) => `${i === 0 ? "M" : "L"}${xFor(i).toFixed(1)} ${yFor(p.benchmark).toFixed(1)}`).join(" ");
  const ticks = 4;
  const yTicks = Array.from({ length: ticks + 1 }, (_, k) => minY + (k / ticks) * (maxY - minY));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" className="border border-black/10 bg-white">
      {yTicks.map((v, i) => (
        <g key={i}>
          <line x1={pad.l} x2={W - pad.r} y1={yFor(v)} y2={yFor(v)} stroke="#e5e5e0" />
          <text x={pad.l - 6} y={yFor(v) + 3} fontSize={9} textAnchor="end" fill="#666" fontFamily="monospace">
            {v.toFixed(0)}
          </text>
        </g>
      ))}
      <path d={benchPath} fill="none" stroke="#16161a" strokeDasharray="3 3" strokeWidth={1.2} />
      <path d={navPath} fill="none" stroke="#990000" strokeWidth={1.8} />
      <text x={pad.l} y={H - 8} fontSize={9} fill="#666" fontFamily="monospace">
        {series[0].date}
      </text>
      <text x={W - pad.r} y={H - 8} fontSize={9} fill="#666" fontFamily="monospace" textAnchor="end">
        {series[series.length - 1].date}
      </text>
      <g transform={`translate(${W - pad.r - 140}, ${pad.t + 6})`}>
        <rect width={140} height={34} fill="white" stroke="#e5e5e0" />
        <line x1={8} x2={20} y1={13} y2={13} stroke="#990000" strokeWidth={1.8} />
        <text x={26} y={16} fontSize={10} fontFamily="monospace" fill="#0a0a0b">Fund</text>
        <line x1={8} x2={20} y1={26} y2={26} stroke="#16161a" strokeDasharray="3 3" strokeWidth={1.2} />
        <text x={26} y={29} fontSize={10} fontFamily="monospace" fill="#0a0a0b">SPY</text>
      </g>
    </svg>
  );
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y, (m || 1) - 1, d || 1));
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const printStyles = `
@media print {
  .report-toolbar { display: none !important; }
  .report-page { max-width: none !important; padding: 0 !important; }
  body { background: white !important; }
  .break-before-page { break-before: page; page-break-before: always; }
  .break-inside-avoid { break-inside: avoid; page-break-inside: avoid; }
}
@page { size: Letter; margin: 0.5in; }
`;

