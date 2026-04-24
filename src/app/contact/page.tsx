import Link from "next/link";

export const metadata = { title: "Contact" };

const FUND_EMAIL = "trojansmif@marshall.usc.edu";

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
        <div className="grid md:grid-cols-3 gap-px bg-[var(--color-rule)] border hairline">
          <Panel
            k="Prospective members"
            title="Join the Fund"
            cta="Email us"
            href={`mailto:${FUND_EMAIL}?subject=${encodeURIComponent("Trojan SMIF — Interest")}`}
          >
            MSF students and other eligible graduates — reach out directly to
            the Executive Committee. Formal recruiting launches Fall 2026.
          </Panel>
          <Panel
            k="Alumni & industry"
            title="Advisory Board, mentorship, speaking"
            cta="Open a conversation"
            href={`mailto:${FUND_EMAIL}?subject=${encodeURIComponent("Trojan SMIF — Alumni / Industry")}`}
          >
            Alumni Advisory Board nominations, analyst mentorship, pitch
            feedback, and guest sessions.
          </Panel>
          <Panel
            k="Marshall faculty"
            title="Coursework & collaboration"
            cta="Propose collaboration"
            href={`mailto:${FUND_EMAIL}?subject=${encodeURIComponent("Trojan SMIF — Faculty")}`}
          >
            Coordinated projects, data access, and curriculum-aligned case
            competitions.
          </Panel>
        </div>
      </section>

      <section className="border-t hairline bg-[var(--color-bone)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 md:py-16 grid md:grid-cols-2 gap-10">
          <div>
            <div className="rule-label flex items-center gap-3">
              <span className="inline-block h-px w-8 bg-[var(--color-cardinal)]" />
              The Fund
            </div>
            <p className="mt-3 font-[family-name:var(--font-display)] text-2xl leading-tight">
              USC Marshall School of Business
              <br />
              <span className="text-[var(--color-muted)] text-base">Master of Science in Finance</span>
            </p>
            <p className="mt-4 text-sm">
              <a
                href={`mailto:${FUND_EMAIL}`}
                className="text-[var(--color-cardinal)] border-b border-[var(--color-cardinal)] pb-0.5"
              >
                {FUND_EMAIL}
              </a>
            </p>
          </div>
          <div>
            <div className="rule-label flex items-center gap-3">
              <span className="inline-block h-px w-8 bg-[var(--color-cardinal)]" />
              Online
            </div>
            <ul className="mt-3 space-y-2">
              <li>
                <a
                  href="https://www.linkedin.com/company/113424338"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[var(--color-cardinal)]"
                >
                  LinkedIn ↗
                </a>
              </li>
              <li>
                <Link href="/portfolio" className="hover:text-[var(--color-cardinal)]">
                  Live Portfolio →
                </Link>
              </li>
              <li>
                <Link href="/leadership" className="hover:text-[var(--color-cardinal)]">
                  Leadership & Roster →
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
        className="mt-6 inline-flex items-center gap-2 text-sm uppercase text-[var(--color-cardinal)] border-b border-[var(--color-cardinal)] pb-1"
      >
        {cta} →
      </a>
    </div>
  );
}
