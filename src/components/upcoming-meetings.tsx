"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";

type Meeting = {
  id: string;
  title: string;
  description: string | null;
  starts_at: string;
  ends_at: string | null;
  location: string | null;
  meeting_url: string | null;
  access_code: string | null;
  kind: string | null;
};

export function UpcomingMeetings({ limit = 5 }: { limit?: number }) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const sb = getSupabaseBrowser();
      if (!sb) {
        setLoading(false);
        return;
      }
      const { data, error } = await sb
        .from("meetings")
        .select("id, title, description, starts_at, ends_at, location, meeting_url, access_code, kind")
        .gte("starts_at", new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString())
        .order("starts_at", { ascending: true })
        .limit(limit);
      if (error) setErr(error.message);
      else setMeetings((data as Meeting[]) ?? []);
      setLoading(false);
    })();
  }, [limit]);

  if (loading) {
    return (
      <div className="text-sm text-[var(--color-muted)] font-mono uppercase">
        Loading meetings…
      </div>
    );
  }
  if (err) {
    const tableMissing = /relation.*does not exist|meetings.*schema cache/i.test(err);
    return (
      <div className="text-[12px] border border-[var(--color-negative)] text-[var(--color-negative)] px-3 py-2 leading-relaxed">
        {tableMissing ? (
          <>
            Meetings table isn&apos;t set up yet — an admin needs to run the
            <span className="font-mono"> 08_meetings.sql </span>
            migration in Supabase.
          </>
        ) : (
          <span className="font-mono uppercase">{err}</span>
        )}
      </div>
    );
  }
  if (meetings.length === 0) {
    return (
      <div className="text-sm text-[var(--color-muted)] leading-relaxed">
        No upcoming meetings on the calendar.
      </div>
    );
  }

  return (
    <ul className="divide-y hairline">
      {meetings.map((m) => (
        <li key={m.id} className="py-3">
          <MeetingRow m={m} />
        </li>
      ))}
    </ul>
  );
}

function MeetingRow({ m }: { m: Meeting }) {
  const start = new Date(m.starts_at);
  const end = m.ends_at ? new Date(m.ends_at) : null;
  const dateStr = start.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const timeStr = start.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  const endTimeStr = end
    ? end.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
    : null;

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[11px] font-mono uppercase text-[var(--color-cardinal)]">
            {dateStr} · {timeStr}
            {endTimeStr ? `–${endTimeStr}` : ""}
            {m.kind ? ` · ${m.kind}` : ""}
          </div>
          <div className="mt-1 font-[family-name:var(--font-display)] text-base leading-tight">
            {m.title}
          </div>
          {m.location && (
            <div className="mt-1 text-[12px] text-[var(--color-muted)]">
              {m.location}
            </div>
          )}
          {m.description && (
            <div className="mt-1 text-[12px] text-[var(--color-muted)] line-clamp-2">
              {m.description}
            </div>
          )}
        </div>
        <a
          href={googleCalUrl(m)}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 text-[10px] font-mono uppercase text-[var(--color-cardinal)] border border-[var(--color-cardinal)] px-2 py-1 hover:bg-[var(--color-cardinal)] hover:text-[var(--color-paper)]"
          title="Add to Google Calendar"
        >
          + Cal
        </a>
      </div>
      {m.meeting_url && (
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px]">
          <a
            href={m.meeting_url}
            target="_blank"
            rel="noreferrer"
            className="text-[var(--color-cardinal)] border-b border-[var(--color-cardinal)] pb-0.5 font-mono text-[11px] uppercase"
          >
            Join ↗
          </a>
        </div>
      )}
    </div>
  );
}

// Builds a Google Calendar "event template" URL. Works for any user — they
// don't need to connect an account. Users click, Google Calendar opens with
// the event pre-filled, they hit Save.
function googleCalUrl(m: Meeting): string {
  const start = new Date(m.starts_at);
  const end = m.ends_at
    ? new Date(m.ends_at)
    : new Date(start.getTime() + 60 * 60 * 1000);
  const fmt = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: m.title,
    dates: `${fmt(start)}/${fmt(end)}`,
    details: [
      m.description || "",
      m.meeting_url ? `Join: ${m.meeting_url}` : "",
    ]
      .filter(Boolean)
      .join("\n\n"),
    location: m.location || "",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
