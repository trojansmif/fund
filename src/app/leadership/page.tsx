import Link from "next/link";
import { SectionLabel } from "@/components/section-label";
import { ROSTER, byTeam, initials, FACULTY_ADVISORS } from "@/lib/roster";
import { ScrollHint } from "@/components/scroll-hint";
import { LinkedInIcon, linkedInSearchUrl } from "@/components/linkedin-icon";

export const metadata = { title: "Leadership" };

export default function LeadershipPage() {
  const exec = byTeam("Executive Committee");
  const directors = byTeam("Directors");

  return (
    <>
      <section className="border-b hairline">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 md:py-20">
          <div className="rule-label flex items-center gap-3">
            <span className="inline-block h-px w-8 bg-[var(--color-cardinal)]" />
            Leadership
          </div>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-[clamp(2rem,6vw,3.75rem)] font-medium leading-[1.1]">
            Executive Committee,<br />Directors, & Faculty Advisors.
          </h1>
          <p className="mt-8 max-w-2xl text-[var(--color-muted)] text-lg leading-relaxed">
            The Executive Committee and all Directors form the Investment
            Committee. Two-thirds quorum is required; pitches pass by simple
            majority; the President casts tie-breakers.
          </p>
        </div>
      </section>

      {/* Executive Committee */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-14 md:py-20">
        <SectionLabel eyebrow="Executive Committee" title="Five seats. One mission." />
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {exec.map((m, i) => (
            <PersonCard
              key={m.name}
              seat={`Seat 0${i + 1}`}
              name={m.name}
              role={m.role}
              linkedin={m.linkedin}
            />
          ))}
        </div>
      </section>

      {/* Directors */}
      <section className="border-y hairline bg-[var(--color-bone)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 md:py-20">
          <SectionLabel
            eyebrow="Directors"
            title="Seven directors lead research."
            subtitle="Each director owns a research team and sits on the Investment Committee. Operations & Technology — the eighth team — reports up to the COO and CTO on the Executive Committee."
          />
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {directors.map((m) => (
              <PersonCard
                key={m.name}
                seat="IC Member"
                name={m.name}
                role={m.role}
                linkedin={m.linkedin}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Faculty Advisors */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-14 md:py-20">
        <SectionLabel eyebrow="Faculty Advisors" title="Oversight from Marshall faculty." />
        <div className="mt-10 grid md:grid-cols-2 gap-8">
          {FACULTY_ADVISORS.map((a) => (
            <article key={a.name} className="border hairline p-8">
              <div className="flex items-start gap-5">
                <div className="h-16 w-16 shrink-0 bg-[var(--color-cardinal)] text-[var(--color-paper)] flex items-center justify-center font-[family-name:var(--font-display)] text-xl">
                  {initials(a.name)}
                </div>
                <div>
                  <h3 className="font-[family-name:var(--font-display)] text-2xl leading-tight">
                    Professor {a.name}
                  </h3>
                  <div className="rule-label mt-1">{a.title}</div>
                  <div className="text-xs text-[var(--color-muted)] mt-0.5">{a.department}</div>
                </div>
              </div>
              <p className="mt-6 text-[15px] text-[var(--color-ink)]/85 leading-relaxed">
                {a.blurb}
              </p>
              <p className="mt-3 text-[13px] text-[var(--color-muted)] leading-relaxed italic">
                {a.relation}
              </p>
              <a
                href={a.url}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex items-center gap-2 text-xs uppercase  text-[var(--color-cardinal)] border-b border-[var(--color-cardinal)] pb-1"
              >
                Marshall faculty page ↗
              </a>
            </article>
          ))}
        </div>
      </section>

      {/* Full Roster Snapshot */}
      <section id="roster" className="border-y hairline bg-[var(--color-bone)] scroll-mt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 md:py-16">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
            <SectionLabel eyebrow="Full Roster" title={`${ROSTER.length} members`} />
            <div className="font-mono text-[10px] uppercase text-[var(--color-muted)]">
              Founding cohort · 2025–2026
            </div>
          </div>
          <ScrollHint />
          <div className="border hairline bg-[var(--color-paper)] overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="bg-[var(--color-bone)]">
                <tr>
                  <Th>Name</Th>
                  <Th>Team</Th>
                  <Th>Role</Th>
                  <Th>LinkedIn</Th>
                </tr>
              </thead>
              <tbody className="divide-y hairline">
                {ROSTER.map((m) => (
                  <tr key={m.name} className="hover:bg-[var(--color-bone)]/60">
                    <td className="px-4 md:px-5 py-3 whitespace-nowrap">{m.name}</td>
                    <td className="px-4 md:px-5 py-3 text-[var(--color-muted)] whitespace-nowrap">{m.team}</td>
                    <td className="px-4 md:px-5 py-3">{m.role}</td>
                    <td className="px-4 md:px-5 py-3">
                      <a
                        href={m.linkedin || linkedInSearchUrl(m.name)}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`${m.name} on LinkedIn`}
                        className="inline-flex items-center justify-center w-7 h-7 border hairline text-[var(--color-muted)] hover:bg-[var(--color-cardinal)] hover:border-[var(--color-cardinal)] hover:text-[var(--color-paper)] transition-colors"
                      >
                        <LinkedInIcon className="w-3.5 h-3.5" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Alumni board CTA */}
      <section className="border-t hairline">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 md:py-16 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="rule-label flex items-center gap-3">
              <span className="inline-block h-px w-8 bg-[var(--color-cardinal)]" />
              Alumni Advisory Board
            </div>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl md:text-4xl leading-tight font-medium">
              Industry mentorship — reviewed annually.
            </h2>
            <p className="mt-4 text-[var(--color-muted)] max-w-xl leading-relaxed">
              Former Fund members and industry professionals commit to an
              annual review of performance, governance, and may propose
              amendments to the bylaws.
            </p>
          </div>
          <div>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-[var(--color-cardinal)] text-[var(--color-paper)] px-6 py-3 text-sm uppercase hover:bg-[var(--color-cardinal-deep)]"
            >
              Nominate an advisor
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function PersonCard({
  seat,
  name,
  role,
  linkedin,
}: {
  seat: string;
  name: string;
  role: string;
  linkedin?: string;
}) {
  const href = linkedin || linkedInSearchUrl(name);
  return (
    <article className="bg-[var(--color-paper)] border hairline p-6 md:p-7 relative">
      <div className="absolute top-0 left-0 h-[3px] w-10 bg-[var(--color-cardinal)]" />
      <div className="flex items-start justify-between">
        <div className="rule-label">{seat}</div>
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          aria-label={`${name} on LinkedIn`}
          className="inline-flex items-center justify-center w-7 h-7 border hairline text-[var(--color-muted)] hover:bg-[var(--color-cardinal)] hover:border-[var(--color-cardinal)] hover:text-[var(--color-paper)] transition-colors"
        >
          <LinkedInIcon className="w-3.5 h-3.5" />
        </a>
      </div>
      <div className="mt-5 flex items-center gap-4">
        <div className="h-12 w-12 shrink-0 bg-[var(--color-cardinal)] text-[var(--color-paper)] flex items-center justify-center font-[family-name:var(--font-display)] text-sm">
          {initials(name)}
        </div>
        <div className="min-w-0">
          <div className="font-[family-name:var(--font-display)] text-xl leading-tight">{name}</div>
        </div>
      </div>
      <p className="mt-4 text-[13px] text-[var(--color-muted)] leading-snug">{role}</p>
    </article>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-5 py-3 text-left font-mono text-[10px] uppercase  text-[var(--color-muted)]">
      {children}
    </th>
  );
}
