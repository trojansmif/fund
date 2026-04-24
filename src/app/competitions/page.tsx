import Link from "next/link";
import { SectionLabel } from "@/components/section-label";

export const metadata = {
  title: "Competitions",
  description:
    "Trojan SMIF competes nationally across investment, valuation, ethics, and women-in-finance case competitions. Companies can partner with the Fund by sponsoring a competition.",
};

const FUND_EMAIL = "trojansmif@marshall.usc.edu";

type Status = "UPCOMING" | "IN PREP" | "CONFIRMED" | "PAST";

type Comp = {
  k: string;
  when: string;
  year: number;
  title: string;
  org: string;
  format: string;
  team: string;
  status: Status;
  blurb: string;
};

const COMPETITIONS: Comp[] = [
  {
    k: "01",
    when: "Fall 2026",
    year: 2026,
    title: "CFA-OC SMIF Competition",
    org: "CFA Society of Orange County",
    format: "Portfolio report + live pitch",
    team: "Main Fund",
    status: "IN PREP",
    blurb:
      "Regional student-managed investment fund competition judged by practitioners from the CFA Society of Orange County. Our first national competition as a founding cohort.",
  },
  {
    k: "02",
    when: "Spring 2026",
    year: 2026,
    title: "Inaugural CFA LA Ethics Challenge",
    org: "CFA Society of Los Angeles",
    format: "Ethics case competition",
    team: "Main Fund",
    status: "PAST",
    blurb:
      "Inaugural Ethics Challenge hosted by CFA Society of Los Angeles, applying the CFA Code of Ethics and Standards of Professional Conduct to live case scenarios.",
  },
  {
    k: "03",
    when: "Fall 2026",
    year: 2026,
    title: "NIBC — Women in Banking",
    org: "National Investment Banking Competition",
    format: "Intercollegiate women's track",
    team: "Women-Led Initiative",
    status: "UPCOMING",
    blurb:
      "Dedicated women's track of the NIBC investment banking case competition. Team fielded through the Women-Led Initiative in Finance.",
  },
  {
    k: "04",
    when: "Spring 2027",
    year: 2027,
    title: "G.A.M.E. Women's Investment Case",
    org: "Quinnipiac University · Global Asset Management Education",
    format: "Pitch + portfolio construction",
    team: "Women-Led Initiative",
    status: "UPCOMING",
    blurb:
      "Women's investment case track of the annual G.A.M.E. forum at Quinnipiac — the largest student-run investment conference in the world.",
  },
];

export default function CompetitionsPage() {
  const upcoming = COMPETITIONS.filter((c) => c.status !== "PAST");
  const past = COMPETITIONS.filter((c) => c.status === "PAST");

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b hairline paper-grain">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 md:py-20">
          <div className="rule-label flex items-center gap-3">
            <span className="inline-block h-px w-8 bg-[var(--color-cardinal)]" />
            Competitions
          </div>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-[clamp(2rem,6vw,3.75rem)] leading-[1.1] font-medium">
            Competing nationally,<br />hosting locally.
          </h1>
          <p className="mt-8 max-w-2xl text-lg text-[var(--color-muted)] leading-relaxed">
            The Fund fields teams in intercollegiate investment, banking, ethics,
            and women-in-finance competitions — and hosts its own case
            challenges at Marshall.
          </p>
        </div>
      </section>

      {/* Upcoming */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12 md:py-16">
        <SectionLabel eyebrow="Upcoming" title="On the calendar." />
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          {upcoming.map((c) => (
            <CompetitionCard key={c.k} c={c} />
          ))}
        </div>
      </section>

      {/* Past */}
      <section className="border-y hairline bg-[var(--color-bone)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 md:py-16">
          <SectionLabel eyebrow="Past" title="Our competition record." />
          {past.length === 0 ? (
            <div className="mt-8 border hairline bg-[var(--color-paper)] p-8 max-w-3xl">
              <div className="rule-label">Founding year</div>
              <p className="mt-3 text-[15px] leading-relaxed text-[var(--color-muted)]">
                Trojan SMIF was founded in Fall 2025. Our first competition
                entries are in prep for Fall 2026. Past results will be
                posted here as they finish — with team rosters, deliverables,
                and judges' comments.
              </p>
            </div>
          ) : (
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              {past.map((c) => (
                <CompetitionCard key={c.k} c={c} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Sponsor — pitched at companies */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12 md:py-20">
        <div className="grid grid-cols-12 gap-6 md:gap-10">
          <div className="col-span-12 md:col-span-5">
            <div className="rule-label flex items-center gap-3">
              <span className="inline-block h-px w-8 bg-[var(--color-cardinal)]" />
              For sponsors
            </div>
            <h2 className="mt-4 font-[family-name:var(--font-display)] text-[clamp(1.75rem,5vw,3rem)] font-medium leading-[1.1]">
              Sponsor a competition.
            </h2>
            <p className="mt-5 text-[var(--color-muted)] leading-relaxed">
              Asset managers, investment banks, and hedge funds — back a
              Trojan SMIF case competition and put your brand in front of
              USC Marshall's top MSF talent.
            </p>
          </div>
          <div className="col-span-12 md:col-span-7">
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              <SponsorTier
                tier="Gold sponsor"
                price="Named competition rights"
                perks={[
                  "Title sponsor of the case competition",
                  "On-stage presence at judging and awards",
                  "Direct access to the winning cohort",
                  "Featured logo on /competitions and printed deliverables",
                ]}
              />
              <SponsorTier
                tier="Silver sponsor"
                price="Judge panel + recruiting"
                perks={[
                  "Two seats on the judging panel",
                  "Exclusive networking dinner with the Fund",
                  "Priority recruiting access to top performers",
                  "Logo on /competitions",
                ]}
              />
              <SponsorTier
                tier="Bronze sponsor"
                price="Recruiting access"
                perks={[
                  "One seat on the judging panel",
                  "Resume book from competing teams",
                  "Logo on /competitions",
                ]}
              />
              <SponsorTier
                tier="Custom"
                price="Let's talk"
                perks={[
                  "Prize pool funding",
                  "Travel & hosting underwriting",
                  "Named case-study deliverable",
                  "Multi-year partnership",
                ]}
              />
            </ul>
          </div>
        </div>

        <div className="mt-10 md:mt-14 border hairline bg-[var(--color-bone)] p-6 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="rule-label">Sponsorship inquiry</div>
            <div className="mt-2 font-[family-name:var(--font-display)] text-2xl md:text-3xl leading-tight">
              Companies — reach the Fund's sponsorship lead.
            </div>
            <p className="mt-3 text-sm text-[var(--color-muted)] max-w-xl leading-relaxed">
              Include the competition you'd like to back, your preferred tier,
              and a point of contact. We'll route you to the Director of
              Communications and the COO.
            </p>
          </div>
          <a
            href={`mailto:${FUND_EMAIL}?subject=${encodeURIComponent(
              "Trojan SMIF — Competition Sponsorship"
            )}&body=${encodeURIComponent(
              `Hi Trojan SMIF,\n\nWe're interested in sponsoring a Trojan SMIF competition.\n\nCompany:\nCompetition of interest:\nPreferred tier:\nContact:\n\nThanks`
            )}`}
            className="inline-flex items-center gap-3 bg-[var(--color-cardinal)] text-[var(--color-paper)] px-6 py-3 text-xs uppercase font-mono hover:bg-[var(--color-cardinal-deep)] whitespace-nowrap"
          >
            Sponsor a competition →
          </a>
        </div>
      </section>
    </>
  );
}

function CompetitionCard({ c }: { c: Comp }) {
  const statusCls =
    c.status === "PAST"
      ? "bg-[var(--color-ink)] text-[var(--color-paper)]"
      : c.status === "CONFIRMED"
      ? "bg-[var(--color-positive)] text-white"
      : c.status === "IN PREP"
      ? "bg-[var(--color-cardinal)] text-[var(--color-paper)]"
      : "border border-[var(--color-cardinal)] text-[var(--color-cardinal)] bg-[var(--color-paper)]";
  return (
    <article className="border hairline bg-[var(--color-paper)] p-6 md:p-7 relative flex flex-col h-full">
      <div className="absolute top-0 left-0 h-[3px] w-10 bg-[var(--color-cardinal)]" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="rule-label">{c.when}</div>
          <h3 className="mt-2 font-[family-name:var(--font-display)] text-xl md:text-2xl leading-tight">{c.title}</h3>
          <div className="mt-1 text-[13px] text-[var(--color-muted)]">{c.org}</div>
        </div>
        <span className={`font-mono text-[10px] uppercase px-2 py-0.5 ${statusCls} whitespace-nowrap`}>
          {c.status}
        </span>
      </div>
      <p className="mt-4 text-[14px] text-[var(--color-ink)]/85 leading-relaxed">{c.blurb}</p>
      <dl className="mt-6 pt-4 border-t hairline grid grid-cols-2 gap-3 text-[12px]">
        <div>
          <dt className="rule-label">Format</dt>
          <dd className="mt-1">{c.format}</dd>
        </div>
        <div>
          <dt className="rule-label">Team</dt>
          <dd className="mt-1">{c.team}</dd>
        </div>
      </dl>
    </article>
  );
}

function SponsorTier({
  tier,
  price,
  perks,
}: {
  tier: string;
  price: string;
  perks: string[];
}) {
  return (
    <li className="border hairline bg-[var(--color-paper)] p-5">
      <div className="flex items-baseline justify-between">
        <div className="rule-label">{tier}</div>
        <div className="font-mono text-[10px] uppercase text-[var(--color-cardinal)]">{price}</div>
      </div>
      <ul className="mt-3 space-y-1.5 text-[13px] text-[var(--color-muted)] leading-relaxed">
        {perks.map((p) => (
          <li key={p} className="flex items-start gap-2">
            <span className="mt-[7px] inline-block w-2 h-[2px] bg-[var(--color-cardinal)] shrink-0" />
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </li>
  );
}
