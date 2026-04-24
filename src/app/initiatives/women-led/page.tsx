import Link from "next/link";
import { SectionLabel } from "@/components/section-label";

export const metadata = {
  title: "Women-Led Initiative in Finance",
  description:
    "A women-only subgroup of Trojan SMIF focused on intercollegiate investment competitions and building a pipeline from USC Marshall's MSF program into senior investment roles.",
};

export default function WomenLedPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b hairline">
        <div className="absolute inset-0 -z-10 paper-grain" />
        <div
          aria-hidden
          className="hidden md:block pointer-events-none absolute -right-24 top-8 w-[520px] h-[520px] opacity-[0.05] -z-10"
          style={{
            backgroundImage: "url('/usc-seal.png')",
            backgroundRepeat: "no-repeat",
            backgroundSize: "contain",
            backgroundPosition: "center",
          }}
        />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 md:py-24">
          <div className="rule-label flex items-center gap-3">
            <span className="inline-block h-px w-8 bg-[var(--color-cardinal)]" />
            Initiative · Flagship
          </div>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-[clamp(2rem,6vw,3.75rem)] leading-[1.1] font-medium max-w-4xl">
            Women-Led Initiative in Finance
          </h1>
          <p className="mt-8 max-w-2xl text-lg text-[var(--color-muted)] leading-relaxed">
            A women-only subgroup of Trojan SMIF, led with Professor Ayca
            Altintig, focused on intercollegiate investment competitions,
            mentorship, and building a pipeline from Marshall MSF into
            senior investment roles.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <span className="tag">USC Marshall · MSF</span>
            <span className="tag">Founded 2025</span>
            <span className="tag">Led by Prof. Altintig</span>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-14 md:py-20">
        <div className="grid grid-cols-12 gap-10">
          <div className="col-span-12 md:col-span-4">
            <SectionLabel eyebrow="Mission" title="More women in seats that matter." />
          </div>
          <div className="col-span-12 md:col-span-7 md:col-start-6 text-[17px] leading-[1.75] space-y-4">
            <p>
              Women are still underrepresented at every level of investment
              management — from analyst seats at asset managers to portfolio
              chairs at endowments and pensions. The Women-Led Initiative
              exists to close that gap at the earliest point in the
              pipeline: the MSF classroom.
            </p>
            <p>
              We train members on valuation, research writing, and pitch
              delivery through dedicated competition prep, alumni office
              hours, and structured mentorship — then send them into
              recruiting better prepared than peer programs.
            </p>
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="border-y hairline bg-[var(--color-bone)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 md:py-20">
          <SectionLabel eyebrow="Faculty Lead" title="Professor Ayca Altintig" />
          <div className="mt-8 max-w-3xl border hairline bg-[var(--color-paper)] p-6 md:p-8">
            <div className="flex items-start gap-5">
              <div className="h-16 w-16 shrink-0 bg-[var(--color-cardinal)] text-[var(--color-paper)] flex items-center justify-center font-[family-name:var(--font-display)] text-xl">
                AA
              </div>
              <div>
                <h3 className="font-[family-name:var(--font-display)] text-2xl leading-tight">
                  Professor Ayca Altintig
                </h3>
                <div className="rule-label mt-1">Associate Professor of Clinical Finance & Business Economics</div>
                <div className="text-xs text-[var(--color-muted)] mt-0.5">
                  Finance & Business Economics · USC Marshall
                </div>
              </div>
            </div>
            <p className="mt-5 text-[15px] text-[var(--color-ink)]/85 leading-relaxed">
              Teaches across personal and corporate finance — including The
              Power of Personal Finance alongside advanced financial
              analysis, valuation, and corporate financial strategy.
              Co-leads the Women-Led Initiative with direct coaching and
              mentorship for every member.
            </p>
            <a
              href="https://www.marshall.usc.edu/personnel/ayca-altintig"
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex items-center gap-2 text-xs uppercase text-[var(--color-cardinal)] border-b border-[var(--color-cardinal)] pb-1"
            >
              Marshall faculty page ↗
            </a>
          </div>
        </div>
      </section>

      {/* Programs */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-14 md:py-20">
        <SectionLabel eyebrow="Programs" title="What members actually do." />
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          <Program
            k="01"
            title="Competition team"
            body="Dedicated prep for competitions that spotlight women in finance — pitch deck coaching, live mock sessions, and feedback from faculty and alumni judges."
          />
          <Program
            k="02"
            title="Alumni office hours"
            body="Monthly small-group calls with alumnae in asset management, investment banking, and private equity. Real recruiting intel, real interview prep."
          />
          <Program
            k="03"
            title="Structured mentorship"
            body="Every member paired with a senior analyst or director. Quarterly check-ins, career planning, and introductions into the network."
          />
          <Program
            k="04"
            title="Valuation workshop series"
            body="Hands-on sessions on DCF, multiples, and scenario analysis — the mechanics behind every memo that reaches the Investment Committee."
          />
          <Program
            k="05"
            title="Research shadowing"
            body="Shadow a sector lead through a full pitch cycle. Draft memos under guidance, sit in on IC pitches, see how decisions actually get made."
          />
          <Program
            k="06"
            title="Speaker series"
            body="Quarterly sessions with senior women investors — portfolio managers, CIOs, heads of research — hosted on campus and recorded for members."
          />
        </div>
      </section>

      {/* Competitions */}
      <section className="border-y hairline bg-[var(--color-bone)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 md:py-20">
          <SectionLabel eyebrow="Competitions" title="On the calendar." />
          <ol className="mt-10 space-y-6 max-w-3xl">
            <CompetitionRow
              when="Spring 2026"
              title="CFA-OC SMIF Competition"
              body="Women's team representing USC Marshall; portfolio report + live pitch judged by practitioners from the CFA Society of Orange County."
            />
            <CompetitionRow
              when="Fall 2026"
              title="NIBC — Women in Banking"
              body="Intercollegiate investment banking case competition with a dedicated women's track."
            />
            <CompetitionRow
              when="Spring 2027"
              title="G.A.M.E. Women's Investment Case"
              body="Quinnipiac's Global Asset Management Education forum — women's investment case track."
            />
          </ol>
        </div>
      </section>

      {/* Membership */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-14 md:py-20">
        <div className="grid grid-cols-12 gap-10">
          <div className="col-span-12 md:col-span-5">
            <SectionLabel eyebrow="Membership" title="Who can join." />
          </div>
          <div className="col-span-12 md:col-span-7">
            <ul className="space-y-4 text-[15px] leading-relaxed">
              <Item>Any woman currently enrolled in a USC graduate program in good academic standing.</Item>
              <Item>Marshall MSF students receive priority access to competition teams.</Item>
              <Item>Members of Trojan SMIF automatically qualify; non-SMIF members are welcome for initiative-specific programming.</Item>
              <Item>Commitment: one core meeting per month plus competition or mentorship cycles.</Item>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t hairline bg-[var(--color-bone)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-block h-[3px] w-16 bg-[var(--color-cardinal)]" />
            <h2 className="mt-6 font-[family-name:var(--font-display)] text-[clamp(1.75rem,5vw,3rem)] font-medium leading-[1.1]">
              Join the initiative.
            </h2>
            <p className="mt-4 max-w-xl text-[var(--color-muted)] leading-relaxed">
              Interested graduate students — reach out to Professor Altintig
              directly, or drop us a line and we'll route you in.
            </p>
          </div>
          <div className="flex flex-wrap md:justify-end gap-3">
            <a
              href="https://www.marshall.usc.edu/personnel/ayca-altintig"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 border border-[var(--color-ink)] px-6 py-3 text-sm uppercase hover:bg-[var(--color-paper)]"
            >
              Prof. Altintig ↗
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-[var(--color-cardinal)] text-[var(--color-paper)] px-6 py-3 text-sm uppercase hover:bg-[var(--color-cardinal-deep)]"
            >
              Contact the Fund
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function Program({ k, title, body }: { k: string; title: string; body: string }) {
  return (
    <div className="border hairline bg-[var(--color-paper)] p-6 relative">
      <div className="absolute top-0 left-0 h-[3px] w-10 bg-[var(--color-cardinal)]" />
      <div className="rule-label">{k}</div>
      <div className="mt-4 font-[family-name:var(--font-display)] text-xl leading-tight">{title}</div>
      <p className="mt-3 text-sm text-[var(--color-muted)] leading-relaxed">{body}</p>
    </div>
  );
}

function CompetitionRow({ when, title, body }: { when: string; title: string; body: string }) {
  return (
    <li className="grid grid-cols-[auto_1fr] gap-6 items-start">
      <div className="font-mono text-xs uppercase text-[var(--color-muted)] w-28 shrink-0 pt-1">{when}</div>
      <div>
        <div className="font-[family-name:var(--font-display)] text-xl leading-tight">{title}</div>
        <p className="mt-1.5 text-[var(--color-muted)] leading-relaxed">{body}</p>
      </div>
    </li>
  );
}

function Item({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-[9px] inline-block w-2 h-[2px] bg-[var(--color-cardinal)]" />
      <span>{children}</span>
    </li>
  );
}
