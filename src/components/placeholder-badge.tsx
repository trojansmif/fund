export function PlaceholderBadge({
  size = "sm",
  label = "Placeholder data",
}: {
  size?: "sm" | "md";
  label?: string;
}) {
  const pad = size === "md" ? "px-3 py-1" : "px-2 py-0.5";
  const fs = size === "md" ? "text-[11px]" : "text-[10px]";
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono uppercase border border-[var(--color-cardinal)] text-[var(--color-cardinal)] bg-[var(--color-paper)] ${pad} ${fs}`}
      title="These figures are placeholders until the Fund's live portfolio tracker is connected."
    >
      <span className="inline-block w-1.5 h-1.5 bg-[var(--color-cardinal)] rounded-full animate-pulse" />
      {label}
    </span>
  );
}

export function PlaceholderBanner({
  title = "Placeholder data on display",
  body = "Live NAV, holdings, and performance figures will be wired in once the Fund's portfolio tracker is connected. Nothing on this page is a real trading record.",
}: {
  title?: string;
  body?: string;
}) {
  return (
    <div className="border hairline bg-[var(--color-paper)] relative">
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[var(--color-cardinal)]" />
      <div className="px-5 py-4 md:py-5 pl-6 md:pl-7 flex flex-col md:flex-row gap-2 md:gap-6 md:items-center">
        <div className="inline-flex items-center gap-2 font-mono text-[11px] uppercase text-[var(--color-cardinal)] shrink-0">
          <span className="inline-block w-2 h-2 bg-[var(--color-cardinal)] rounded-full animate-pulse" />
          {title}
        </div>
        <div className="text-sm text-[var(--color-ink)]/80 leading-relaxed">{body}</div>
      </div>
    </div>
  );
}
