"use client";

import { useEffect, useState } from "react";

export function LiveUpdated({ asOf }: { asOf: string }) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const laTime = now
    ? new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Los_Angeles",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(now)
    : "--:--:--";

  const laDate = now
    ? new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Los_Angeles",
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(now)
    : "";

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-1 font-mono text-[11px] uppercase">
      <span className="inline-flex items-center gap-2">
        <span className="inline-block w-1.5 h-1.5 bg-[var(--color-positive)] rounded-full animate-pulse" />
        <span className="text-[var(--color-ink)]">{laTime} PT</span>
      </span>
      <span className="text-[var(--color-muted)]">{laDate}</span>
      <span className="text-[var(--color-muted)]">Data as of {asOf}</span>
    </div>
  );
}
