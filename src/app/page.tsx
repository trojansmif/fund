import Link from "next/link";
import { SectionLabel } from "@/components/section-label";
import { KPI } from "@/components/kpi";
import { PerfChart } from "@/components/perf-chart";
import { WeightBars } from "@/components/weight-bars";
import { PlaceholderBadge, PlaceholderBanner } from "@/components/placeholder-badge";
import { SEED_SNAPSHOT, formatPct, formatUSD } from "@/lib/portfolio";
import { ROSTER } from "@/lib/roster";

export default function HomePage() {
  const s = SEED_SNAPSHOT;
  const excess = s.sinceInception - 15.1; // proxy vs SPY path
  return (
    <div className="home-tight">
      {/* Hero */}
      <section className="relative overflow-hidden border-b hairline">
        <div className="absolute inset-0 -z-10 paper-grain" />
        <div
          aria-hidden
          className="hidden md:block pointer-events-none absolute -right-24 top-8 w-[520px] h-[520px] opacity-[0.055] -z-10"
          style={{
            backgroundImage: "url('/usc-seal.png')",
            backgroundRepeat: "no-repeat",
            backgroundSize: "contain",
            backgroundPosition: "center",
          }}
        />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-14 pb-16 md:pt-24 md:pb-28">
          <div className="grid grid-cols-12 gap-8 items-start">
            <div className="col-span-12 md:col-span-8">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <span className="tag">Founded Fall 2025</span>
                <span className="tag">USC Marshall · MSF</span>
                <Link href="/leadership#roster" className="tag hover:border-[var(--color-cardinal)] hover:text-[var(--color-cardinal)]">
                  {ROSTER.length} Members →
                </Link>
              </div>
              <h1
                className="font-[family-name:var(--font-display)] text-[clamp(2rem,7vw,4rem)] leading-[0.95] font-semibold"
                style={{ wordSpacing: "-0.18em", letterSpacing: "-0.015em" }}
              >
                Managed by students,{" "}
                <span className="hidden md:inline"><br /></span>
                driven by <span className="text-[var(--color-cardinal)]">excellence.</span>
              </h1>
              <p className="mt-5 md:mt-7 max-w-xl text-base sm:text-lg text-[var(--color-muted)] leading-relaxed">
                The Trojan Student Managed Investment Fund gives USC Marshall
                Master of Science in Finance students hands-on experience
                managing a diversified, long-only portfolio across US equities,
                international equities, fixed income, and alternatives.
              </p>
              <div className="mt-6 md:mt-9 flex flex-wrap items-center gap-3 sm:gap-4">
                <Link
                  href="/portfolio"
                  className="inline-flex items-center gap-3 bg-[var(--color-cardinal)] text-[var(--color-paper)] px-6 py-3 text-sm uppercase hover:bg-[var(--color-cardinal-deep)] transition-colors"
                >
                  View live portfolio
                  <span aria-hidden>→</span>
                </Link>
                <a
                  href="https://www.linkedin.com/company/113424338"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-3 border border-[var(--color-ink)] px-6 py-3 text-sm uppercase hover:bg-[var(--color-cardinal)] hover:border-[var(--color-cardinal)] hover:text-[var(--color-paper)] transition-colors"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden>
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.024-3.037-1.852-3.037-1.854 0-2.136 1.445-2.136 2.939v5.667H9.35V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.268 2.37 4.268 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.063 2.063 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.543C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  Follow on LinkedIn
                </a>
              </div>
            </div>
            <div className="col-span-12 md:col-span-4 hidden md:block">
              <div className="border hairline bg-[var(--color-paper)]">
                <div className="flex items-center justify-between px-5 py-3 border-b hairline gap-3">
                  <div className="rule-label">Fund Snapshot</div>
                  <PlaceholderBadge />
                </div>
                <div className="px-5 py-6">
                  <div className="rule-label">Net Asset Value</div>
                  <div className="mt-1 font-[family-name:var(--font-display)] text-[clamp(1.875rem,6vw,3rem)] font-num">
                    {formatUSD(s.nav)}
                  </div>
                  <div className="mt-1 font-num text-sm text-[var(--color-positive)]">
                    {formatPct(s.sinceInception)} since inception · {formatPct(excess)} vs SPY
                  </div>
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div>
                      <div className="rule-label">Sharpe</div>
                      <div className="font-num text-xl mt-1">{s.sharpe.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="rule-label">Beta vs SPY</div>
                      <div className="font-num text-xl mt-1">{s.beta.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="rule-label">Max Drawdown</div>
                      <div className="font-num text-xl mt-1 text-[var(--color-negative)]">
                        {formatPct(s.maxDrawdown)}
                      </div>
                    </div>
                    <div>
                      <div className="rule-label">Positions</div>
                      <div className="font-num text-xl mt-1">{s.positions}</div>
                    </div>
                  </div>
                </div>
                <div className="px-5 py-3 border-t hairline flex items-center justify-between text-xs">
                  <span className="text-[var(--color-muted)]">Benchmark · SPY</span>
                  <Link href="/portfolio" className="text-[var(--color-cardinal)] hover:underline">
                    Full report →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* KPI strip */}
      <section className="border-b hairline">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-6 flex items-center justify-between gap-3">
          <div className="rule-label flex items-center gap-3">
            <span className="inline-block h-px w-8 bg-[var(--color-cardinal)]" />
            Performance summary
          </div>
          <PlaceholderBadge />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-3 pb-12">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-px bg-[var(--color-rule)]">
            <Metric label="Starting AUM" value={formatUSD(s.startingAUM)} />
            <Metric label="Current NAV" value={formatUSD(s.nav)} />
            <Metric label="Annualized Return" value={formatPct(s.annualizedReturn)} tone="positive" />
            <Metric label="Annualized Vol." value={`${s.annualizedVol.toFixed(2)}%`} />
            <Metric label="Alpha vs SPY" value={formatPct(s.alpha)} tone="positive" />
            <Metric label="Info Ratio" value={s.informationRatio.toFixed(2)} />
          </div>
        </div>
      </section>

      {/* Narrative */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-14 md:py-24">
        <div className="grid grid-cols-12 gap-10">
          <div className="col-span-12 md:col-span-5">
            <SectionLabel
              eyebrow="The Fund"
              title="Fundamental research. Real committee decisions. Measured risk."
            />
          </div>
          <div className="col-span-12 md:col-span-6 md:col-start-7 text-[var(--color-ink)]/85 leading-[1.75] text-[17px] space-y-5">
            <p>
              Every holding in the portfolio began as an analyst's memo — a
              thesis, a valuation, a risk map. Pitches are debated and voted on
              by the Investment Committee, with the Chief Risk Officer empowered
              to veto trades that breach Fund policy.
            </p>
            <p>
              We operate as a long-only, multi-asset Fund with a 12–18 month
              horizon, paper-traded against the S&P 500. Our job isn't just to
              beat a benchmark — it's to build Marshall students into
              defensible, thoughtful investors.
            </p>
            <div className="pt-4 grid grid-cols-3 gap-6">
              <Stat k="$1M" v="Starting AUM" />
              <Stat k="8" v="Investment teams" />
              <Stat k="12–18 mo" v="Typical horizon" />
            </div>
          </div>
        </div>
      </section>

      {/* Placeholder banner — pulled out of the beige Performance panel
          so it sits on the white background above, with clear separation. */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pt-6 md:pt-10 pb-10 md:pb-14">
        <PlaceholderBanner
          body="The NAV curve and every figure below are illustrative until the SMIF Portfolio Tracker is connected to the live feed."
        />
      </section>

      {/* Performance panel */}
      <section className="border-y hairline">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 md:py-14">
          <div className="flex flex-wrap items-end justify-between gap-6 mb-10">
            <SectionLabel
              eyebrow="Performance"
              title="Portfolio vs benchmark"
              subtitle={`Indexed to 100 at inception (Aug 13, 2025). Live NAV updates nightly from the SMIF Portfolio Tracker.`}
            />
            <Link href="/portfolio" className="text-sm border-b border-[var(--color-ink)] pb-1 hover:text-[var(--color-cardinal)] hover:border-[var(--color-cardinal)]">
              Open full portfolio report →
            </Link>
          </div>
          <div className="border hairline bg-[var(--color-paper)] p-6 md:p-8">
            <PerfChart data={s.navSeries.filter((_, i) => i % 3 === 0)} />
          </div>
        </div>
      </section>

      {/* Sector allocation + policy */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-14 md:py-24">
        <div className="grid grid-cols-12 gap-10">
          <div className="col-span-12 md:col-span-7">
            <SectionLabel eyebrow="Allocation" title="Where the Fund is invested" />
            <p className="mt-4 text-[var(--color-muted)] max-w-xl">
              Sector weights for the long book. Cash is deliberately elevated
              while the Fund ramps positions in its first full year.
            </p>
            <div className="mt-8">
              <WeightBars
                rows={s.sectors.map((x) => ({
                  label: x.sector,
                  value: x.weight,
                }))}
                max={25}
              />
            </div>
          </div>
          <div className="col-span-12 md:col-span-4 md:col-start-9">
            <div className="border hairline p-7 h-full bg-[var(--color-bone)] relative">
              <div className="absolute top-0 left-0 h-[3px] w-10 bg-[var(--color-cardinal)]" />
              <div className="rule-label">Risk Policy</div>
              <h3 className="mt-3 font-[family-name:var(--font-display)] text-3xl leading-tight">
                Hard limits, always.
              </h3>
              <dl className="mt-8 space-y-4 text-sm">
                <Limit k="Position cap" v="5% of NAV" />
                <Limit k="Sector cap" v="25% of NAV" />
                <Limit k="Single trade cap" v="3% of NAV" />
                <Limit k="Cash floor" v="2% minimum" />
                <Limit k="Stop-loss alert" v="−15% position" />
              </dl>
              <Link
                href="/about#risk"
                className="mt-8 inline-flex items-center gap-2 text-xs uppercase text-[var(--color-cardinal)] border-b border-[var(--color-cardinal)] pb-1"
              >
                Risk framework →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t hairline">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-24 grid grid-cols-12 gap-10 items-center">
          <div className="col-span-12 md:col-span-8">
            <span className="inline-block h-[3px] w-16 bg-[var(--color-cardinal)]" />
            <h2 className="mt-8 font-[family-name:var(--font-display)] text-[clamp(1.875rem,6vw,3.75rem)] font-medium leading-[1.05]">
              Help steward the next chapter of the Fund.
            </h2>
            <p className="mt-6 max-w-xl text-[var(--color-muted)] leading-relaxed">
              The Fund is in its founding year. Formal recruiting launches
              Fall 2026. Until then, MSF students can join by reaching out
              directly to the Executive Committee.
            </p>
          </div>
          <div className="col-span-12 md:col-span-4 flex md:justify-end">
            <a
              href="https://www.linkedin.com/company/113424338"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-3 bg-[var(--color-cardinal)] text-[var(--color-paper)] px-8 py-4 text-sm uppercase hover:bg-[var(--color-cardinal-deep)] transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden>
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.024-3.037-1.852-3.037-1.854 0-2.136 1.445-2.136 2.939v5.667H9.35V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.268 2.37 4.268 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.063 2.063 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.543C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              Follow on LinkedIn
            </a>
          </div>
        </div>
      </section>
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
    <div className="bg-[var(--color-paper)] p-5">
      <div className="rule-label">{label}</div>
      <div className={`mt-2 font-num text-2xl md:text-3xl ${tint}`}>{value}</div>
    </div>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="font-[family-name:var(--font-display)] text-3xl">{k}</div>
      <div className="rule-label mt-1">{v}</div>
    </div>
  );
}

function Limit({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between border-b hairline pb-3">
      <dt className="text-[var(--color-ink)]/80">{k}</dt>
      <dd className="font-num text-[var(--color-cardinal)]">{v}</dd>
    </div>
  );
}

