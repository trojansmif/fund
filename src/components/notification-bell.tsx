"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { useSupabaseSession } from "@/lib/supabase/use-session";

type Announcement = {
  id: string;
  title: string;
  created_at: string;
  tag: string | null;
};

type Meeting = {
  id: string;
  title: string;
  starts_at: string;
  location: string | null;
};

const LS_KEY = "trojansmif.notifs.lastSeen";

export function NotificationBell() {
  const { user } = useSupabaseSession();
  const [anns, setAnns] = useState<Announcement[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [lastSeen, setLastSeen] = useState<number>(0);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  // Load last-seen from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const v = window.localStorage.getItem(LS_KEY);
    setLastSeen(v ? Number(v) : 0);
  }, []);

  const loadAll = useCallback(async () => {
    const sb = getSupabaseBrowser();
    if (!sb || !user) return;
    const [annRes, meetRes] = await Promise.all([
      sb
        .from("announcements")
        .select("id, title, created_at, tag")
        .order("created_at", { ascending: false })
        .limit(5),
      sb
        .from("meetings")
        .select("id, title, starts_at, location")
        .gte("starts_at", new Date().toISOString())
        .order("starts_at", { ascending: true })
        .limit(5),
    ]);
    if (annRes.data) setAnns(annRes.data as Announcement[]);
    if (meetRes.data) setMeetings(meetRes.data as Meeting[]);
  }, [user]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const newAnns = useMemo(
    () => anns.filter((a) => Date.parse(a.created_at) > lastSeen),
    [anns, lastSeen]
  );
  const newMeetings = useMemo(
    // Meetings are "new" if created after lastSeen; we don't have created_at
    // on the selected meeting columns, so treat any upcoming meeting as
    // fresh until the user opens the bell (good-enough heuristic for an org
    // of 44).
    () => (lastSeen === 0 ? meetings : meetings.filter((m) => Date.parse(m.starts_at) > lastSeen)),
    [meetings, lastSeen]
  );

  const unreadCount = newAnns.length + newMeetings.length;

  function markSeen() {
    const now = Date.now();
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LS_KEY, String(now));
    }
    setLastSeen(now);
  }

  function toggle() {
    setOpen((v) => {
      const next = !v;
      if (next) {
        // Refresh on open so the list is current
        loadAll();
      } else {
        markSeen();
      }
      return next;
    });
  }

  if (!user) return null;

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={unreadCount > 0 ? `${unreadCount} new notifications` : "Notifications"}
        className="relative inline-flex items-center justify-center h-9 w-9 border border-[var(--color-cardinal)] bg-[var(--color-paper)] hover:bg-[var(--color-bone)] transition-colors"
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[var(--color-cardinal)] text-[var(--color-paper)] text-[10px] font-mono font-bold flex items-center justify-center rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+6px)] w-[340px] max-h-[70vh] overflow-auto bg-[var(--color-paper)] border hairline shadow-lg z-50"
        >
          <div className="px-4 py-3 border-b hairline bg-[var(--color-bone)] flex items-center justify-between">
            <div className="rule-label">Notifications</div>
            <button
              type="button"
              onClick={markSeen}
              className="text-[10px] font-mono uppercase text-[var(--color-muted)] hover:text-[var(--color-cardinal)]"
            >
              Mark all read
            </button>
          </div>

          {anns.length === 0 && meetings.length === 0 ? (
            <div className="px-4 py-6 text-sm text-[var(--color-muted)]">
              Nothing to show.
            </div>
          ) : (
            <>
              {anns.length > 0 && (
                <div className="py-2">
                  <div className="px-4 py-1 text-[10px] font-mono uppercase tracking-wider text-[var(--color-muted)]">
                    Messages
                  </div>
                  {anns.map((a) => {
                    const isNew = Date.parse(a.created_at) > lastSeen;
                    return (
                      <Link
                        key={a.id}
                        href="/dashboard?tab=messages"
                        onClick={() => {
                          markSeen();
                          setOpen(false);
                        }}
                        className="flex items-start gap-3 px-4 py-2.5 hover:bg-[var(--color-bone)]/60"
                      >
                        {isNew && (
                          <span className="mt-1.5 w-2 h-2 rounded-full bg-[var(--color-cardinal)] shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-medium truncate">{a.title}</div>
                          <div className="text-[10px] font-mono uppercase text-[var(--color-muted)] mt-0.5">
                            {a.tag || "GENERAL"} · {relTime(a.created_at)}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}

              {meetings.length > 0 && (
                <div className="py-2 border-t hairline">
                  <div className="px-4 py-1 text-[10px] font-mono uppercase tracking-wider text-[var(--color-muted)]">
                    Upcoming meetings
                  </div>
                  {meetings.map((m) => (
                    <Link
                      key={m.id}
                      href="/dashboard"
                      onClick={() => {
                        markSeen();
                        setOpen(false);
                      }}
                      className="flex items-start gap-3 px-4 py-2.5 hover:bg-[var(--color-bone)]/60"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-medium truncate">{m.title}</div>
                        <div className="text-[10px] font-mono uppercase text-[var(--color-muted)] mt-0.5">
                          {formatDateTime(m.starts_at)}
                          {m.location ? ` · ${m.location}` : ""}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}

          <div className="px-4 py-3 border-t hairline text-[10px] font-mono uppercase text-[var(--color-muted)] flex items-center justify-between">
            <Link
              href="/dashboard?tab=messages"
              onClick={() => setOpen(false)}
              className="hover:text-[var(--color-cardinal)]"
            >
              All messages →
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="hover:text-[var(--color-cardinal)]"
            >
              Dashboard →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function BellIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10 21a2 2 0 0 0 4 0" />
    </svg>
  );
}

function relTime(iso: string): string {
  const diff = Date.now() - Date.parse(iso);
  const s = Math.floor(diff / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
