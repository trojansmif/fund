import Link from "next/link";
import { SectionLabel } from "@/components/section-label";

export const metadata = { title: "Initiatives" };

export default function InitiativesPage() {
  return (
    <>
      <section className="border-b hairline">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 md:py-20">
          <div className="rule-label flex items-center gap-3">
            <span className="inline-block h-px w-8 bg-[var(--color-cardinal)]" />
            Initiatives
          </div>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-[clamp(2rem,6vw,3.75rem)] leading-[1.1] font-medium">
            Building the Fund —<br />beyond the portfolio.
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-14 md:py-20">
        <Link
          href="/initiatives/women-led"
          className="group block border hairline bg-[var(--color-paper)] hover:border-[var(--color-cardinal)] transition-colors"
        >
          <div className="grid grid-cols-12">
            <div className="col-span-12 md:col-span-5 p-8 md:p-10">
              <div className="rule-label flex items-center gap-3">
                <span className="inline-block h-px w-8 bg-[var(--color-cardinal)]" />
                Flagship
              </div>
              <h3 className="mt-4 font-[family-name:var(--font-display)] text-3xl md:text-4xl leading-tight font-medium group-hover:text-[var(--color-cardinal)]">
                Women-Led Initiative in Finance
              </h3>
              <p className="mt-5 text-[var(--color-muted)] leading-relaxed">
                Led with Professor Ayca Altintig — a women-only subgroup of
                Trojan SMIF focused on intercollegiate competitions,
                mentorship, and the pipeline from MSF into senior investment
                roles.
              </p>
              <span className="mt-6 inline-flex items-center gap-2 text-xs uppercase text-[var(--color-cardinal)] border-b border-[var(--color-cardinal)] pb-1">
                Visit the initiative →
              </span>
            </div>
            <div className="col-span-12 md:col-span-7 bg-[var(--color-cardinal)] text-white p-10 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10" aria-hidden>
                <svg viewBox="0 0 400 400" className="w-full h-full">
                  <defs>
                    <pattern id="diag" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                      <rect width="8" height="16" fill="white" />
                    </pattern>
                  </defs>
                  <rect width="400" height="400" fill="url(#diag)" />
                </svg>
              </div>
              <div className="relative">
                <div className="rule-label text-white/70">Competition focus</div>
                <h3 className="mt-3 font-[family-name:var(--font-display)] text-3xl md:text-4xl leading-tight font-medium">
                  From pitch decks to portfolio chairs.
                </h3>
                <p className="mt-5 text-white/85 max-w-md leading-relaxed">
                  Valuation, research writing, and pitch delivery — trained
                  through competitions, alumni office hours, and structured
                  mentorship.
                </p>
              </div>
            </div>
          </div>
        </Link>
      </section>

      <section className="border-y hairline bg-[var(--color-bone)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 md:py-16">
          <SectionLabel eyebrow="Roadmap" title="Upcoming initiatives." />
          <ol className="mt-10 space-y-6 max-w-3xl">
            {roadmap.map((r, i) => (
              <li key={r.title} className="grid grid-cols-[auto_1fr] gap-6 items-start">
                <div className="font-num text-4xl text-[var(--color-cardinal)]">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div>
                  <div className="rule-label">{r.term}</div>
                  <h3 className="mt-1 font-[family-name:var(--font-display)] text-2xl">
                    {r.title}
                  </h3>
                  <p className="mt-2 text-[var(--color-muted)] leading-relaxed">
                    {r.blurb}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}

const roadmap = [
  {
    term: "Spring 2026",
    title: "CFA-OC SMIF Competition entry",
    blurb:
      "First competition entry; deck and portfolio report due to CFA Society of Orange County.",
  },
  {
    term: "Summer 2026",
    title: "Alumni mentorship program launch",
    blurb:
      "Pair analysts with Marshall alumni in asset management, investment banking, and equity research.",
  },
  {
    term: "Fall 2026",
    title: "Inaugural Trojan SMIF Ethics Challenge",
    blurb:
      "Marshall-wide ethics case competition judged by faculty and alumni.",
  },
  {
    term: "2027+",
    title: "Live-capital pilot",
    blurb:
      "Raise an initial tranche of alumni-funded capital for live investment under faculty oversight.",
  },
];
