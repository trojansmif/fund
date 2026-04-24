import Link from "next/link";
import { Wordmark } from "./wordmark";

export function SiteFooter() {
  return (
    <footer className="mt-16 md:mt-24 border-t hairline bg-[var(--color-bone)]">
      <div className="h-[3px] w-full bg-[var(--color-cardinal)]" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 md:py-16 grid md:grid-cols-12 gap-10">
        <div className="md:col-span-5">
          <Wordmark />
          <p className="mt-6 text-sm text-[var(--color-muted)] max-w-md leading-relaxed">
            Trojan Student Managed Investment Fund is an MSF-exclusive
            student-run investment organization at the University of Southern
            California Marshall School of Business. Founded Fall 2025.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <span className="tag">USC Marshall</span>
            <span className="tag">MSF Exclusive</span>
            <span className="tag">Est. 2025</span>
          </div>
        </div>
        <div className="md:col-span-2">
          <div className="rule-label mb-4">The Fund</div>
          <ul className="space-y-2 text-sm">
            <li><Link href="/about" className="hover:text-[var(--color-cardinal)]">About</Link></li>
            <li><Link href="/portfolio" className="hover:text-[var(--color-cardinal)]">Live Portfolio</Link></li>
            <li><Link href="/research" className="hover:text-[var(--color-cardinal)]">Research</Link></li>
            <li><Link href="/teams" className="hover:text-[var(--color-cardinal)]">Teams</Link></li>
          </ul>
        </div>
        <div className="md:col-span-2">
          <div className="rule-label mb-4">Governance</div>
          <ul className="space-y-2 text-sm">
            <li><Link href="/leadership" className="hover:text-[var(--color-cardinal)]">Leadership</Link></li>
            <li><Link href="/about#policy" className="hover:text-[var(--color-cardinal)]">Investment Policy</Link></li>
            <li><Link href="/about#risk" className="hover:text-[var(--color-cardinal)]">Risk Framework</Link></li>
            <li><Link href="/about#ethics" className="hover:text-[var(--color-cardinal)]">Ethics</Link></li>
          </ul>
        </div>
        <div className="md:col-span-3">
          <div className="rule-label mb-4">Connect</div>
          <ul className="space-y-2 text-sm">
            <li><Link href="/contact" className="hover:text-[var(--color-cardinal)]">Contact</Link></li>
            <li>
              <a href="https://www.linkedin.com/company/113424338" target="_blank" rel="noreferrer" className="hover:text-[var(--color-cardinal)]">
                LinkedIn ↗
              </a>
            </li>
            <li>
              <a href="https://www.marshall.usc.edu" target="_blank" rel="noreferrer" className="hover:text-[var(--color-cardinal)]">
                USC Marshall ↗
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t hairline">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 text-xs text-[var(--color-muted)]">
          © {new Date().getFullYear()} Trojan Student Managed Investment Fund. All activity is paper-traded for academic purposes.
        </div>
      </div>
    </footer>
  );
}
