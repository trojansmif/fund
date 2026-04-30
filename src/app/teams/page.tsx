import { SectionLabel } from "@/components/section-label";
import { TeamAccordion } from "@/components/team-accordion";
import { ROSTER, type RosterEntry } from "@/lib/roster";

export const metadata = { title: "Teams" };

type Team = {
  k: string;
  name: string;
  lead: string;
  blurb: string;
  detail: string;
  match: (m: RosterEntry) => boolean;
  /** If present, overrides the default roster-filter lineup with a custom
   *  list (used for US Equities to show all 11 GICS sectors explicitly). */
  sectorLineup?: { label: string; name: string; role: string }[];
};

const EQUITY_SECTORS: { label: string; name: string; role: string }[] = [
  { label: "Energy", name: "Arnav Dudeja", role: "Co-Energy + Utilities Lead" },
  { label: "Energy", name: "Mridul Bhatla", role: "Co-Energy Lead" },
  { label: "Materials", name: "Hao-Chen (Howard) Shieh", role: "Materials + Real Estate Lead" },
  { label: "Industrials", name: "Ian Martin", role: "Industrials Lead" },
  { label: "Consumer Discretionary", name: "Nnamdi Chika-Nwanja", role: "Consumer Discretionary Lead" },
  { label: "Consumer Staples", name: "Mrudula Gurumani", role: "Consumer Staples Lead" },
  { label: "Health Care", name: "Dylan Martling", role: "Healthcare Lead" },
  { label: "Financials", name: "Vivian Wei", role: "Financials Lead" },
  { label: "Information Technology", name: "Mark Huber", role: "Technology Lead" },
  { label: "Communication Services", name: "Yanting (Christine) Zhao", role: "Communication Services Lead" },
  { label: "Utilities", name: "Arnav Dudeja", role: "Co-Energy + Utilities Lead" },
  { label: "Real Estate", name: "Hao-Chen (Howard) Shieh", role: "Materials + Real Estate Lead" },
  { label: "International", name: "Shreya Thakkar", role: "International Equities Lead" },
];

const TEAMS: Team[] = [
  {
    k: "EC",
    name: "Executive Committee",
    lead: "President + CIO",
    blurb: "Five seats: President, COO, CRO, Chief Economist, CTO.",
    detail:
      "The Executive Committee runs Fund operations and chairs the Investment Committee. Five elected seats: President + CIO, COO + Director of Operations, CRO, Chief Economist + US Economics Lead, and CTO. Every trade the Fund executes requires a majority of the IC (EC + Directors); the President casts tie-breakers, the CRO may veto trades that breach policy, and the Faculty Advisors hold non-voting oversight.",
    match: (m) => m.team === "Executive Committee",
  },
  {
    k: "DR",
    name: "Directors",
    lead: "Seven directors — one per research team",
    blurb: "Chair each research team; sit on the Investment Committee.",
    detail:
      "Each Director owns a research team and votes on the Investment Committee alongside the Executive Committee. Seven directorships cover Fixed Income (co-directed), Risk Management, Economics Research, Alternative Investments, Quantitative Strategies, and US + International Equities. Operations & Technology — the seventh team — reports to the COO and CTO on the EC.",
    match: (m) => m.team === "Directors",
  },
  {
    k: "01",
    name: "Equities",
    lead: "Director of US + International Equities",
    blurb: "11 GICS sectors plus international coverage.",
    detail:
      "Bottom-up fundamental research across all 11 GICS sectors — Energy, Materials, Industrials, Consumer Discretionary, Consumer Staples, Health Care, Financials, Information Technology, Communication Services, Utilities, Real Estate — plus international coverage through ADRs and global ETFs with an FX overlay. Every idea is a written memo before it reaches the Investment Committee. Some leads double up on adjacent sectors: Arnav Dudeja owns both Energy (as Co-Lead alongside Mridul Bhatla) and Utilities; Hao-Chen (Howard) Shieh covers both Materials and Real Estate.",
    match: () => false, // sectorLineup takes over for Equities
    sectorLineup: EQUITY_SECTORS,
  },
  {
    k: "02",
    name: "Fixed Income",
    lead: "Co-Directors of Fixed Income",
    blurb: "IG credit, high yield, structured products, rates & sovereign debt.",
    detail:
      "Duration, credit, and rates positioning across the yield curve. Co-directors split coverage; IG lead owns investment-grade credit, HY lead owns high yield and structured products.",
    match: (m) =>
      m.team === "Fixed Income" ||
      (m.team === "Directors" && m.role.includes("Fixed Income")),
  },
  {
    k: "03",
    name: "Alternative Investments",
    lead: "Director of Alternative Investments",
    blurb: "Commodities, real assets, and hedge-fund-style exposures.",
    detail:
      "Gold, commodities, and real-asset sleeves plus liquid alternatives. Scope kept narrow by policy (5% max alternatives) — focus is on risk-off hedges and real-rate convexity.",
    match: (m) =>
      m.team === "Alternative Investments" ||
      (m.team === "Directors" && m.role.includes("Alternative Investments")),
  },
  {
    k: "04",
    name: "Quantitative Strategies",
    lead: "Director of Quantitative Strategies",
    blurb: "Factor modeling and portfolio analytics.",
    detail:
      "Factor attribution, risk modeling, and private-markets research. Builds the quantitative lens the Investment Committee uses to stress-test fundamental pitches.",
    match: (m) =>
      m.team === "Quantitative Strategies" ||
      (m.team === "Directors" && m.role.includes("Quantitative Strategies")),
  },
  {
    k: "05",
    name: "Economics Research",
    lead: "Chief Economist + Director of Economics Research",
    blurb: "Global macro, econometric forecasting, thematic outlook.",
    detail:
      "Owns the annual economic view and monthly macro read-outs. Econometrics, global macro, and thematic research feed sector and fixed-income decisions.",
    match: (m) =>
      m.team === "Economics Research" ||
      (m.team === "Directors" && m.role.includes("Economics Research")) ||
      (m.team === "Executive Committee" && m.role.includes("Chief Economist")),
  },
  {
    k: "06",
    name: "Risk Management",
    lead: "Chief Risk Officer + Director of Risk Management",
    blurb: "Limits monitoring, stress testing, compliance, reporting.",
    detail:
      "Monitors the 5% / 25% / 2% / 3% / 15% policy limits continuously. Reports breaches to the Investment Committee within one business day. The CRO may veto any trade that breaches risk policy — override requires a two-thirds IC supermajority.",
    match: (m) =>
      m.team === "Risk Management" ||
      (m.team === "Directors" && m.role.includes("Risk Management")) ||
      (m.team === "Executive Committee" && m.role.includes("Chief Risk")),
  },
  {
    k: "07",
    name: "Operations & Technology",
    lead: "COO + CTO",
    blurb: "Budgeting, recruiting, data infrastructure, tooling.",
    detail:
      "Owns the operating budget, recruiting cycle, data pipelines, the portfolio tracker, and the public website. The CTO maintains this site and the /portfolio data feed.",
    match: (m) =>
      m.team === "Executive Committee" &&
      (m.role.includes("Operating") || m.role.includes("Technology")),
  },
  {
    k: "08",
    name: "Analysts",
    lead: "Cross-team analyst pool",
    blurb: "First-year MSF analysts rotating across research teams.",
    detail:
      "The Fund's analyst bench. Analysts rotate across Equities, Fixed Income, and Alternative Investments based on Director need and member interest, building cross-asset coverage before specializing as second-years.",
    match: (m) => m.team === "Analysts",
  },
];

export default function TeamsPage() {
  const withMembers = TEAMS.map((t) => ({
    ...t,
    members: ROSTER.filter(t.match),
  }));

  return (
    <>
      <section className="border-b hairline paper-grain">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 md:py-20">
          <div className="rule-label flex items-center gap-3">
            <span className="inline-block h-px w-8 bg-[var(--color-cardinal)]" />
            Teams
          </div>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-[clamp(2rem,6vw,3.75rem)] leading-[1.1] font-medium">
            One Investment Committee.<br />All the moving parts.
          </h1>
          <p className="mt-8 max-w-2xl text-lg text-[var(--color-muted)] leading-relaxed">
            Tap any team to see its members and what they own. Every team is
            led by a Director who sits on the Investment Committee alongside
            the Executive Committee.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12 md:py-16">
        <div className="space-y-3 md:space-y-4">
          {withMembers.map((t) => (
            <TeamAccordion
              key={t.k}
              k={t.k}
              name={t.name}
              lead={t.lead}
              blurb={t.blurb}
              detail={t.detail}
              members={t.members}
              sectorLineup={t.sectorLineup}
            />
          ))}
        </div>
      </section>

      <section className="border-t hairline bg-[var(--color-bone)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 md:py-16">
          <SectionLabel eyebrow="Support" title="Support functions & analyst pool" />
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            <Support k="Communications & External Affairs" v="External brand, alumni relations, competition outreach." />
            <Support k="Fundraising (Co-Directors ×2)" v="Alumni cultivation and long-term capital plan." />
            <Support k="General Analysts (×3)" v="Cross-team rotation; first-year MSF analyst pool." />
          </div>
        </div>
      </section>
    </>
  );
}

function Support({ k, v }: { k: string; v: string }) {
  return (
    <div className="bg-[var(--color-paper)] border hairline p-6">
      <div className="rule-label">{k}</div>
      <p className="mt-3 text-sm text-[var(--color-muted)] leading-relaxed">{v}</p>
    </div>
  );
}
