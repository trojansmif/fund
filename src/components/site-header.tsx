"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Wordmark } from "./wordmark";
import { LinkedInIcon } from "./linkedin-icon";
import { UserMenu } from "./user-menu";
import { NotificationBell } from "./notification-bell";
import { useSupabaseSession } from "@/lib/supabase/use-session";

const nav = [
  { href: "/about", label: "About" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/teams", label: "Teams" },
  { href: "/leadership", label: "Leadership" },
  { href: "/research", label: "Research" },
  { href: "/competitions", label: "Competitions" },
  { href: "/initiatives", label: "Initiatives" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const pathname = usePathname();
  const loginRef = useRef<HTMLDivElement | null>(null);
  const { user, loading: sessionLoading } = useSupabaseSession();
  const isSignedIn = !!user && !sessionLoading;

  // Hide the site header on the public /m/[username] profile page and
  // on the print-ready /portfolio/report page — both render their own
  // brand mark and are meant to be focused, chrome-free surfaces.
  if (pathname?.startsWith("/m/")) return null;
  if (pathname?.startsWith("/portfolio/report")) return null;

  useEffect(() => {
    setOpen(false);
    setLoginOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close login dropdown when clicking outside
  useEffect(() => {
    if (!loginOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!loginRef.current?.contains(e.target as Node)) setLoginOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLoginOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [loginOpen]);

  const memberLoginHref = `/sign-in?next=${encodeURIComponent("/dashboard")}`;
  const adminLoginHref = `/sign-in?next=${encodeURIComponent("/dashboard?tab=admin")}`;

  return (
    <header className="sticky top-0 z-40 bg-[var(--color-paper)]/90 backdrop-blur border-b hairline">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group shrink-0" onClick={() => setOpen(false)}>
          <Wordmark className="group-hover:text-[var(--color-cardinal)] transition-colors" />
        </Link>

        <nav className="hidden md:flex items-center gap-5 lg:gap-6 text-sm">
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

        <div className="flex items-center gap-3">
          {/* Far-right: notifications + avatar menu when signed in, login dropdown when not */}
          {isSignedIn ? (
            <div className="hidden sm:flex items-center gap-3">
              <NotificationBell />
              <UserMenu />
            </div>
          ) : (
            <div className="hidden sm:block relative" ref={loginRef}>
              <button
                type="button"
                onClick={() => setLoginOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={loginOpen}
                className="inline-flex items-center gap-2 rounded-none border border-[var(--color-cardinal)] bg-[var(--color-cardinal)] text-[var(--color-paper)] h-9 px-4 text-xs uppercase hover:bg-[var(--color-cardinal-deep)] hover:border-[var(--color-cardinal-deep)] transition-colors"
              >
                Log in
                <svg viewBox="0 0 10 6" className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path d="M1 1l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {loginOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-[calc(100%+4px)] w-[220px] bg-[var(--color-paper)] border hairline shadow-md z-50 divide-y hairline"
                >
                  <Link
                    href={memberLoginHref}
                    onClick={() => setLoginOpen(false)}
                    className="flex items-center justify-between gap-3 h-12 px-4 text-sm hover:bg-[var(--color-bone)]"
                  >
                    <span>Member login</span>
                    <span aria-hidden className="text-[var(--color-cardinal)]">→</span>
                  </Link>
                  <Link
                    href={adminLoginHref}
                    onClick={() => setLoginOpen(false)}
                    className="flex items-center justify-between gap-3 h-12 px-4 text-sm hover:bg-[var(--color-bone)]"
                  >
                    <span>Admin login</span>
                    <span aria-hidden className="text-[var(--color-cardinal)]">→</span>
                  </Link>
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="md:hidden inline-flex items-center justify-center h-10 w-10 border hairline bg-[var(--color-paper)]"
          >
            <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
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
            href={memberLoginHref}
            className="flex items-center justify-between px-5 py-4 text-[15px] bg-[var(--color-cardinal)] text-[var(--color-paper)] hover:bg-[var(--color-cardinal-deep)]"
          >
            <span className="uppercase text-xs">Member login</span>
            <span aria-hidden>→</span>
          </Link>
          <Link
            href={adminLoginHref}
            className="flex items-center justify-between px-5 py-4 text-[15px] bg-[var(--color-cardinal-deep)] text-[var(--color-paper)]"
          >
            <span className="uppercase text-xs">Admin login</span>
            <span aria-hidden>→</span>
          </Link>
          <a
            href="https://www.linkedin.com/company/113424338"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between px-5 py-4 text-[15px]"
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
