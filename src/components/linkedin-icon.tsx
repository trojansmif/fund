export function LinkedInIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.024-3.037-1.852-3.037-1.854 0-2.136 1.445-2.136 2.939v5.667H9.35V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.268 2.37 4.268 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.063 2.063 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.543C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

export function linkedInSearchUrl(name: string) {
  const clean = name.replace(/\([^)]*\)/g, "").replace(/['"]/g, "").trim();
  return `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(
    `${clean} USC Marshall`
  )}`;
}

/** Ensures a LinkedIn URL has a protocol, so it works as an anchor href. */
export function normalizeLinkedin(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed.replace(/^\/\//, "")}`;
}

/** Renders the LinkedIn chip in cardinal red when the member has a real URL,
 *  or in a muted/bordered style when we only have a name-search fallback. */
export function LinkedInChip({
  linkedin,
  name,
  size = "sm",
}: {
  linkedin?: string | null;
  name: string;
  size?: "sm" | "md";
}) {
  const normalized = normalizeLinkedin(linkedin);
  const href = normalized ?? linkedInSearchUrl(name);
  const hasReal = !!normalized;
  const dims = size === "md" ? "w-8 h-8" : "w-7 h-7";
  const icon = size === "md" ? "w-4 h-4" : "w-3.5 h-3.5";
  const cls = hasReal
    ? `${dims} bg-[var(--color-cardinal)] border border-[var(--color-cardinal)] text-[var(--color-paper)] hover:bg-[var(--color-cardinal-deep)]`
    : `${dims} border hairline text-[var(--color-muted)] hover:bg-[var(--color-cardinal)] hover:border-[var(--color-cardinal)] hover:text-[var(--color-paper)]`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={`${name} on LinkedIn`}
      title={hasReal ? `${name} on LinkedIn` : `Search for ${name} on LinkedIn`}
      className={`inline-flex items-center justify-center transition-colors shrink-0 ${cls}`}
    >
      <LinkedInIcon className={icon} />
    </a>
  );
}
