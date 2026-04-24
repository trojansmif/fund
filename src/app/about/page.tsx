import Link from "next/link";
import { SectionLabel } from "@/components/section-label";

export const metadata = { title: "About the Fund" };

export default function AboutPage() {
  return (
    <>
      <section className="border-b hairline paper-grain">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 md:py-24">
          <div className="rule-label flex items-center gap-3">
            <span className="inline-block h-px w-8 bg-[var(--color-cardinal)]" />
            About
          </div>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-[clamp(2rem,6vw,3.75rem)] leading-[1.1] font-medium">
            A real fund, run by<br />Marshall MSF students.
          </h1>
          <p className="mt-8 max-w-2xl text-lg text-[var(--color-muted)] leading-relaxed">
            Founded in Fall 2025, Trojan SMIF is an MSF-exclusive
            investment organization operating under the USC Marshall School of
            Business. We give students the practice, discipline, and
            governance of a professional asset manager — at the scale of a
            student portfolio.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-14 md:py-20">
        <div className="grid grid-cols-12 gap-10">
          <div className="col-span-12 md:col-span-4">
            <SectionLabel eyebrow="Mission" title="Build investors, not watchers." />
          </div>
          <div className="col-span-12 md:col-span-7 md:col-start-6 text-[17px] leading-[1.75] space-y-4">
            <p>
              We develop Marshall MSF students into disciplined investors
              through fundamental analysis, quantitative methods, and formal
              risk management — then send them into asset management, IB, and
              investment roles better prepared than the market expects.
            </p>
            <p>
              Members run research teams, publish memos, present pitches, and
              vote on trades. Faculty advisors provide oversight; the Chief
              Risk Officer enforces policy. Every decision is documented.
            </p>
          </div>
        </div>
      </section>

      <section id="policy" className="border-y hairline bg-[var(--color-bone)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 md:py-20">
          <SectionLabel eyebrow="Investment Policy" title="Mandate, benchmark, horizon." />
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-px bg-[var(--color-rule)] border hairline">
            <Card
              k="Mandate"
              v="Diversified, long-only portfolio across US & international equities, fixed income, ETFs, and limited alternatives. No leverage. No short sales. All activity paper-traded."
            />
            <Card k="Benchmark" v="S&P 500 (SPY) as primary. Asset-class benchmarks approved per sleeve." />
            <Card k="Horizon" v="12–18 month default. Thesis-driven overrides require IC approval." />
          </div>
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-px bg-[var(--color-rule)] border hairline">
            {[
              { k: "US Equities", v: "50%" },
              { k: "Fixed Income", v: "25%" },
              { k: "International", v: "15%" },
              { k: "Alternatives", v: "5%" },
              { k: "Cash", v: "5%" },
            ].map((t) => (
              <div key={t.k} className="bg-[var(--color-paper)] p-5 text-center">
                <div className="rule-label">Target</div>
                <div className="mt-2 font-num text-2xl">{t.v}</div>
                <div className="text-xs text-[var(--color-muted)] mt-1">{t.k}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="risk" className="mx-auto max-w-7xl px-4 sm:px-6 py-14 md:py-20">
        <div className="grid grid-cols-12 gap-10">
          <div className="col-span-12 md:col-span-5">
            <SectionLabel eyebrow="Risk" title="The CRO can veto any trade." />
            <p className="mt-5 text-[var(--color-muted)] leading-relaxed">
              The Risk Management team monitors policy limits continuously.
              Breaches are reported to the Investment Committee within one
              business day. A CRO veto requires a two-thirds Investment
              Committee supermajority to override.
            </p>
          </div>
          <div className="col-span-12 md:col-span-7">
            <div className="border hairline divide-y hairline">
              <Limit k="Maximum position size" v="5% of NAV" />
              <Limit k="Maximum GICS sector exposure" v="25% of NAV" />
              <Limit k="Maximum single trade" v="3% of NAV" />
              <Limit k="Cash floor" v="2% of NAV" />
              <Limit k="Stop-loss alert" v="−15% on any position" />
              <Limit k="Risk review" v="Annual — IC re-approves limits" />
            </div>
          </div>
        </div>
      </section>

      <section id="ethics" className="border-t hairline bg-[var(--color-bone)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 md:py-20">
          <div className="grid grid-cols-12 gap-10">
            <div className="col-span-12 md:col-span-5">
              <div className="rule-label flex items-center gap-3">
                <span className="inline-block h-px w-8 bg-[var(--color-cardinal)]" />
                Ethics & Conduct
              </div>
              <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl md:text-5xl font-medium leading-tight">
                CFA Institute standard. No exceptions.
              </h2>
            </div>
            <div className="col-span-12 md:col-span-6 md:col-start-7 text-[var(--color-ink)]/85 leading-[1.8] space-y-4">
              <p>
                Members follow the CFA Institute Code of Ethics and Standards
                of Professional Conduct. Personal conflicts of interest must
                be disclosed; the member recuses from related research,
                voting, and trading.
              </p>
              <p>
                Internal research, holdings detail, and committee
                deliberations are confidential and may not be shared outside
                the Fund without Executive Committee approval.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 text-sm uppercase text-[var(--color-cardinal)] border-b border-[var(--color-cardinal)] pb-1"
              >
                Request the bylaws →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-14 md:py-20">
        <SectionLabel eyebrow="Long-term goals" title="The next chapter." />
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Goal
            k="01"
            title="Compete nationally"
            v="CFA-OC SMIF Competition, Ethics Challenge, and select intercollegiate invitationals."
          />
          <Goal
            k="02"
            title="Raise real capital"
            v="Transition from paper to live capital through an alumni-funded tranche under faculty oversight."
          />
          <Goal
            k="03"
            title="Fund Marshall scholarships"
            v="Endow scholarships for Marshall MSF students from Fund performance and alumni giving."
          />
        </div>
      </section>
    </>
  );
}

function Card({ k, v }: { k: string; v: string }) {
  return (
    <div className="bg-[var(--color-paper)] p-6">
      <div className="rule-label">{k}</div>
      <p className="mt-3 text-[15px] leading-relaxed">{v}</p>
    </div>
  );
}

function Limit({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between py-4 px-5">
      <div className="text-[15px]">{k}</div>
      <div className="font-num text-[var(--color-cardinal)]">{v}</div>
    </div>
  );
}

function Goal({ k, title, v }: { k: string; title: string; v: string }) {
  return (
    <div className="border hairline p-7 relative">
      <div className="absolute top-0 left-0 h-[3px] w-10 bg-[var(--color-cardinal)]" />
      <div className="rule-label">{k}</div>
      <div className="mt-4 font-[family-name:var(--font-display)] text-2xl">{title}</div>
      <p className="mt-3 text-sm text-[var(--color-muted)] leading-relaxed">{v}</p>
    </div>
  );
}
