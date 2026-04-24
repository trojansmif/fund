import Link from "next/link";
import { SectionLabel } from "@/components/section-label";

export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <>
      <section className="border-b hairline">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 md:py-20">
          <div className="rule-label flex items-center gap-3">
            <span className="inline-block h-px w-8 bg-[var(--color-cardinal)]" />
            Contact
          </div>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-[clamp(2rem,6vw,3.75rem)] leading-[1.1] font-medium">
            Talk to the Fund.
          </h1>
          <p className="mt-8 max-w-2xl text-lg text-[var(--color-muted)] leading-relaxed">
            Prospective members, alumni, Marshall faculty, and investment
            professionals are welcome to reach out.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12 md:py-16">
        <div className="grid md:grid-cols-2 gap-px bg-[var(--color-rule)] border hairline">
          <Panel
            k="Prospective members"
            title="Join the Fund"
            cta="Email us"
            href="mailto:connorchisick@gmail.com?subject=Trojan%20SMIF%20%E2%80%94%20Interest"
          >
            MSF students and other eligible graduates — reach out directly to
            the Executive Committee. Formal recruiting launches Fall 2026.
          </Panel>
          <Panel
            k="Alumni & industry"
            title="Advisory Board, mentorship, speaking"
            cta="Open a conversation"
            href="mailto:connorchisick@gmail.com?subject=Trojan%20SMIF%20%E2%80%94%20Alumni%20%2F%20Industry"
          >
            Alumni Advisory Board nominations, analyst mentorship, pitch
            feedback, and guest sessions.
          </Panel>
          <Panel
            k="Marshall faculty"
            title="Coursework & collaboration"
            cta="Propose collaboration"
            href="mailto:connorchisick@gmail.com?subject=Trojan%20SMIF%20%E2%80%94%20Faculty"
          >
            Coordinated projects, data access, and curriculum-aligned case
            competitions.
          </Panel>
          <Panel
            k="Press & media"
            title="Quotes, events, and coverage"
            cta="Media inquiry"
            href="mailto:connorchisick@gmail.com?subject=Trojan%20SMIF%20%E2%80%94%20Media"
          >
            Coverage, commentary, and event invitations. We'll route through
            the Director of Communications.
          </Panel>
        </div>
      </section>

      <section className="border-t hairline bg-[var(--color-bone)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 md:py-16 grid md:grid-cols-3 gap-10">
          <div>
            <div className="rule-label flex items-center gap-3">
              <span className="inline-block h-px w-8 bg-[var(--color-cardinal)]" />
              Find us
            </div>
            <p className="mt-3 font-[family-name:var(--font-display)] text-2xl leading-tight">
              JFF 414<br />
              <span className="text-[var(--color-muted)] text-base">USC Marshall School of Business</span>
            </p>
            <p className="mt-3 text-sm text-[var(--color-muted)]">Mondays · 6:00 PM PT</p>
          </div>
          <div>
            <div className="rule-label flex items-center gap-3">
              <span className="inline-block h-px w-8 bg-[var(--color-cardinal)]" />
              Virtual
            </div>
            <p className="mt-3 font-[family-name:var(--font-display)] text-2xl leading-tight">
              Zoom<br />
              <span className="text-[var(--color-muted)] text-base">Thursdays</span>
            </p>
            <p className="mt-3 text-sm text-[var(--color-muted)]">Link distributed to members</p>
          </div>
          <div>
            <div className="rule-label flex items-center gap-3">
              <span className="inline-block h-px w-8 bg-[var(--color-cardinal)]" />
              Online
            </div>
            <ul className="mt-3 space-y-2">
              <li>
                <a href="https://www.linkedin.com/company/113424338" target="_blank" rel="noreferrer" className="hover:text-[var(--color-cardinal)]">
                  LinkedIn ↗
                </a>
              </li>
              <li>
                <Link href="/portfolio" className="hover:text-[var(--color-cardinal)]">
                  Live Portfolio →
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}

function Panel({
  k,
  title,
  children,
  cta,
  href,
}: {
  k: string;
  title: string;
  children: React.ReactNode;
  cta: string;
  href: string;
}) {
  return (
    <div className="bg-[var(--color-paper)] p-8">
      <div className="rule-label">{k}</div>
      <h3 className="mt-3 font-[family-name:var(--font-display)] text-3xl leading-tight">
        {title}
      </h3>
      <p className="mt-4 text-[var(--color-muted)] leading-relaxed">{children}</p>
      <a
        href={href}
        className="mt-6 inline-flex items-center gap-2 text-sm uppercase  text-[var(--color-cardinal)] border-b border-[var(--color-cardinal)] pb-1"
      >
        {cta} →
      </a>
    </div>
  );
}
