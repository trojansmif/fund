"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Wordmark } from "./wordmark";
import { LinkedInIcon } from "./linkedin-icon";

const nav = [
  { href: "/about", label: "About" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/teams", label: "Teams" },
  { href: "/leadership", label: "Leadership" },
  { href: "/research", label: "Research" },
  { href: "/initiatives", label: "Initiatives" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close menu whenever route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll while menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 bg-[var(--color-paper)]/90 backdrop-blur border-b hairline">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group shrink-0" onClick={() => setOpen(false)}>
          <Wordmark className="group-hover:text-[var(--color-cardinal)] transition-colors" />
        </Link>

        <nav className="hidden md:flex items-center gap-6 lg:gap-7 text-sm">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="text-[var(--color-ink)]/80 hover:text-[var(--color-cardinal)] transition-colors"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/sign-in"
            className="hidden sm:inline-flex items-center gap-2 rounded-none border border-[var(--color-cardinal)] bg-[var(--color-cardinal)] text-[var(--color-paper)] h-9 px-4 text-xs uppercase hover:bg-[var(--color-cardinal-deep)] hover:border-[var(--color-cardinal-deep)] transition-colors"
          >
            Member login
            <span aria-hidden>→</span>
          </Link>
          <a
            href="https://www.linkedin.com/company/113424338"
            target="_blank"
            rel="noreferrer"
            aria-label="Trojan SMIF on LinkedIn"
            className="hidden sm:inline-flex items-center justify-center rounded-none border border-[var(--color-cardinal)] bg-[var(--color-cardinal)] text-[var(--color-paper)] h-9 w-9 hover:bg-[var(--color-cardinal-deep)] hover:border-[var(--color-cardinal-deep)] transition-colors"
          >
            <LinkedInIcon className="w-4 h-4" />
          </a>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="md:hidden inline-flex items-center justify-center h-10 w-10 border hairline bg-[var(--color-paper)]"
          >
            <span className="sr-only">Menu</span>
            <svg
              viewBox="0 0 24 24"
              aria-hidden
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            >
              {open ? (
                <>
                  <line x1="5" y1="5" x2="19" y2="19" />
                  <line x1="19" y1="5" x2="5" y2="19" />
                </>
              ) : (
                <>
                  <line x1="4" y1="7" x2="20" y2="7" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="17" x2="20" y2="17" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      <div
        className={`md:hidden overflow-hidden border-t hairline transition-[max-height] duration-300 ease-out ${
          open ? "max-h-[calc(100vh-4rem)]" : "max-h-0"
        }`}
      >
        <nav className="bg-[var(--color-paper)] divide-y hairline">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="flex items-center justify-between px-5 py-4 text-[15px] hover:text-[var(--color-cardinal)]"
            >
              <span>{n.label}</span>
              <span className="text-[var(--color-cardinal)] font-mono text-xs">→</span>
            </Link>
          ))}
          <Link
            href="/sign-in"
            className="flex items-center justify-between px-5 py-4 text-[15px] bg-[var(--color-cardinal)] text-[var(--color-paper)] hover:bg-[var(--color-cardinal-deep)]"
          >
            <span className="uppercase text-xs">Member login</span>
            <span aria-hidden>→</span>
          </Link>
          <a
            href="https://www.linkedin.com/company/113424338"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between px-5 py-4 text-[15px] bg-[var(--color-cardinal-deep)] text-[var(--color-paper)]"
          >
            <span className="uppercase text-xs inline-flex items-center gap-2">
              <LinkedInIcon className="w-3.5 h-3.5" />
              LinkedIn
            </span>
            <span aria-hidden>↗</span>
          </a>
        </nav>
      </div>
    </header>
  );
}
