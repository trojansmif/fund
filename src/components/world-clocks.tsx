"use client";

import { useEffect, useState } from "react";

type Hub = {
  city: string;
  country: string;
  tz: string;
  exchange: string;
  hours: [string, string][];
};

const HUBS: Hub[] = [
  { city: "Los Angeles", country: "USA", tz: "America/Los_Angeles", exchange: "USC SMIF · HQ", hours: [] },
  { city: "New York", country: "USA", tz: "America/New_York", exchange: "NYSE", hours: [["09:30", "16:00"]] },
  { city: "London", country: "UK", tz: "Europe/London", exchange: "LSE", hours: [["08:00", "16:30"]] },
  { city: "Frankfurt", country: "DE", tz: "Europe/Berlin", exchange: "XETRA", hours: [["09:00", "17:30"]] },
  { city: "Hong Kong", country: "HK", tz: "Asia/Hong_Kong", exchange: "HKEX", hours: [["09:30", "12:00"], ["13:00", "16:00"]] },
  { city: "Tokyo", country: "JP", tz: "Asia/Tokyo", exchange: "TSE", hours: [["09:00", "11:30"], ["12:30", "15:00"]] },
];

export function WorldClocks() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-px bg-[var(--color-rule)] border hairline">
      {HUBS.map((h) => (
        <HubCell key={h.city} hub={h} now={now} />
      ))}
    </div>
  );
}

function HubCell({ hub, now }: { hub: Hub; now: Date | null }) {
  const status = now ? marketStatus(hub, now) : null;
  const dateFmt = new Intl.DateTimeFormat("en-US", { timeZone: hub.tz, weekday: "short", month: "short", day: "numeric" });
  const timeFmt = new Intl.DateTimeFormat("en-GB", { timeZone: hub.tz, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });

  return (
    <div className="bg-[var(--color-paper)] p-5 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="rule-label">{hub.city}</div>
        {status && (
          <span
            className={`font-mono text-[9px] uppercase px-1.5 py-0.5 ${
              status.state === "open"
                ? "bg-[var(--color-positive)] text-white"
                : status.state === "lunch"
                ? "bg-[var(--color-gold)] text-[var(--color-ink)]"
                : "bg-[var(--color-rule)] text-[var(--color-muted)]"
            }`}
          >
            {status.label}
          </span>
        )}
      </div>
      <div className="font-num text-2xl md:text-3xl">
        {now ? timeFmt.format(now) : "--:--:--"}
      </div>
      <div className="flex items-center justify-between text-[10px] font-mono uppercase text-[var(--color-muted)]">
        <span>{now ? dateFmt.format(now) : "···"}</span>
        <span>{hub.exchange}</span>
      </div>
    </div>
  );
}

function marketStatus(hub: Hub, now: Date): { state: "open" | "closed" | "lunch"; label: string } {
  if (hub.hours.length === 0) return { state: "open", label: "HQ" };
  const localMinutes = localTimeMinutes(now, hub.tz);
  const weekday = localWeekday(now, hub.tz);
  if (weekday === 0 || weekday === 6) return { state: "closed", label: "Weekend" };
  const inSession = hub.hours.some(([open, close]) => localMinutes >= toMin(open) && localMinutes < toMin(close));
  if (inSession) return { state: "open", label: "Open" };
  if (hub.hours.length > 1) {
    const first = hub.hours[0];
    const last = hub.hours[hub.hours.length - 1];
    if (localMinutes >= toMin(first[1]) && localMinutes < toMin(last[0])) return { state: "lunch", label: "Break" };
  }
  return { state: "closed", label: "Closed" };
}

function toMin(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function localTimeMinutes(d: Date, tz: string): number {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(d);
  const h = parseInt(parts.find((p) => p.type === "hour")?.value ?? "0", 10);
  const m = parseInt(parts.find((p) => p.type === "minute")?.value ?? "0", 10);
  return h * 60 + m;
}

function localWeekday(d: Date, tz: string): number {
  const weekdayStr = new Intl.DateTimeFormat("en-US", { timeZone: tz, weekday: "short" }).format(d);
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(weekdayStr);
}
