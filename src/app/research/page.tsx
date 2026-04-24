import Link from "next/link";
import { SectionLabel } from "@/components/section-label";
import { ScrollHint } from "@/components/scroll-hint";
import { PlaceholderBadge } from "@/components/placeholder-badge";
import { ResearchRepository } from "@/components/research-repository";

export const metadata = { title: "Research" };

const pipeline = [
  { id: "CRM", company: "Salesforce", analyst: "A. Student", status: "PITCHED", rec: "BUY", upside: "+18%", when: "2026-04-21" },
  { id: "NFLX", company: "Netflix", analyst: "B. Student", status: "APPROVED", rec: "BUY", upside: "+22%", when: "2026-04-14" },
  { id: "F", company: "Ford Motor", analyst: "C. Student", status: "REJECTED", rec: "HOLD", upside: "+4%", when: "2026-04-07" },
  { id: "SHOP", company: "Shopify", analyst: "D. Student", status: "RESEARCH", rec: "—", upside: "—", when: "2026-04-01" },
];

const memos = [
  { title: "Infrastructure cycle + dealer inventory reset: initiating CAT", sector: "Industrials", analyst: "Equities · Industrials", date: "2026-03-18" },
  { title: "Gold and real-rate convexity — adding GLD as hedge sleeve", sector: "Alternatives", analyst: "Alternative Investments", date: "2026-02-27" },
  { title: "Azure + Copilot: durable margin expansion at MSFT", sector: "Technology", analyst: "Equities · Technology", date: "2026-02-05" },
  { title: "Rates outlook: long-duration Treasuries as insurance", sector: "Fixed Income", analyst: "Fixed Income · Rates", date: "2026-01-22" },
];

const statusColor: Record<string, string> = {
  PITCHED: "bg-[var(--color-gold)] text-[var(--color-ink)]",
  APPROVED: "bg-[var(--color-positive)] text-white",
  REJECTED: "bg-[var(--color-negative)] text-white",
  RESEARCH: "bg-[var(--color-ink)] text-[var(--color-gold)]",
};

export default function ResearchPage() {
  return (
    <>
      <section className="border-b hairline">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 md:py-20">
          <div className="rule-label flex items-center gap-3">
            <span className="inline-block h-px w-8 bg-[var(--color-cardinal)]" />
            Research
          </div>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-[clamp(2rem,6vw,3.75rem)] font-medium leading-[1.1]">
            Every trade starts<br />as a written memo.
          </h1>
          <p className="mt-8 max-w-2xl text-lg text-[var(--color-muted)] leading-relaxed">
            Analysts publish memos, Directors approve pitches, and the
            Investment Committee votes. Here's what's live in the pipeline.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12 md:py-16">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <SectionLabel eyebrow="Pipeline" title="Current pitch tracker" />
          <div className="pt-1 shrink-0">
            <PlaceholderBadge />
          </div>
        </div>
        <div className="mt-8">
          <ScrollHint />
        </div>
        <div className="border hairline overflow-x-auto">
          <table className="min-w-[680px] md:min-w-full text-sm">
            <thead className="bg-[var(--color-bone)]">
              <tr className="text-left">
                <Th>Ticker</Th>
                <Th>Company</Th>
                <Th>Analyst</Th>
                <Th>Rec</Th>
                <Th>Upside</Th>
                <Th>Last Update</Th>
                <Th align="right">Status</Th>
              </tr>
            </thead>
            <tbody className="divide-y hairline">
              {pipeline.map((p) => (
                <tr key={p.id} className="hover:bg-[var(--color-bone)]/50">
                  <Td mono>{p.id}</Td>
                  <Td>{p.company}</Td>
                  <Td muted>{p.analyst}</Td>
                  <Td mono>{p.rec}</Td>
                  <Td mono>{p.upside}</Td>
                  <Td mono muted>{p.when}</Td>
                  <Td align="right">
                    <span
                      className={`inline-block px-2 py-0.5 text-[10px] uppercase  font-mono ${statusColor[p.status]}`}
                    >
                      {p.status}
                    </span>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="border-t hairline">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 md:py-16">
          <SectionLabel
            eyebrow="Repository"
            title="Member-submitted pitches"
            subtitle="Shared by analysts from the Fund Dashboard — includes the memo attachment."
          />
          <div className="mt-8">
            <ResearchRepository />
          </div>
        </div>
      </section>

      <section className="border-t hairline bg-[var(--color-bone)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 md:py-16">
          <SectionLabel eyebrow="Memos" title="Recent research notes." />
          <ul className="mt-8 divide-y hairline border hairline bg-[var(--color-paper)]">
            {memos.map((m) => (
              <li key={m.title} className="grid grid-cols-12 gap-4 p-6 items-center">
                <div className="col-span-12 md:col-span-7">
                  <div className="rule-label">{m.sector}</div>
                  <div className="mt-2 font-[family-name:var(--font-display)] text-xl leading-tight">
                    {m.title}
                  </div>
                </div>
                <div className="col-span-6 md:col-span-3 text-sm text-[var(--color-muted)]">
                  {m.analyst}
                </div>
                <div className="col-span-6 md:col-span-2 text-right font-mono text-xs text-[var(--color-muted)]">
                  {m.date}
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-sm text-[var(--color-muted)]">
            Internal memos, deliberations, and voting records are confidential
            per the Fund bylaws.{" "}
            <Link href="/contact" className="underline decoration-[var(--color-cardinal)] underline-offset-4">
              Contact us
            </Link>{" "}
            for access requests.
          </p>
        </div>
      </section>

    </>
  );
}

function Th({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "right" }) {
  return (
    <th
      className="px-5 py-3 font-mono text-[10px] uppercase  text-[var(--color-muted)]"
      style={{ textAlign: align }}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  mono,
  muted,
  align = "left",
}: {
  children: React.ReactNode;
  mono?: boolean;
  muted?: boolean;
  align?: "left" | "right";
}) {
  return (
    <td
      className={`px-5 py-3 ${mono ? "font-num" : ""} ${muted ? "text-[var(--color-muted)]" : ""}`}
      style={{ textAlign: align }}
    >
      {children}
    </td>
  );
}
