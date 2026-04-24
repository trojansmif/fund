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

const KINDS = ["IC", "All-Fund", "Team", "Social", "Training", "Other"];

export function MeetingsAdmin() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [fetching, setFetching] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [kind, setKind] = useState(KINDS[0]);
  const [recurrence, setRecurrence] = useState<"none" | "weekly" | "biweekly" | "monthly">("none");
  const [repeatCount, setRepeatCount] = useState(8);
  const [saving, setSaving] = useState(false);

  async function load() {
    const sb = getSupabaseBrowser();
    if (!sb) return;
    setFetching(true);
    const { data, error } = await sb
      .from("meetings")
      .select("id, title, description, starts_at, ends_at, location, meeting_url, access_code, kind")
      .gte("starts_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order("starts_at", { ascending: true });
    if (error) setMsg({ kind: "err", text: error.message });
    else setMeetings((data as Meeting[]) ?? []);
    setFetching(false);
  }

  useEffect(() => {
    load();
  }, []);

  function resetForm() {
    setTitle("");
    setDescription("");
    setDate("");
    setStartTime("");
    setEndTime("");
    setLocation("");
    setMeetingUrl("");
    setKind(KINDS[0]);
    setRecurrence("none");
    setRepeatCount(8);
  }

  function addInterval(d: Date, kind: typeof recurrence, i: number): Date {
    const n = new Date(d);
    if (kind === "weekly") n.setDate(n.getDate() + i * 7);
    else if (kind === "biweekly") n.setDate(n.getDate() + i * 14);
    else if (kind === "monthly") n.setMonth(n.getMonth() + i);
    return n;
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!title.trim() || !date || !startTime) {
      setMsg({ kind: "err", text: "Title, date, and start time are required." });
      return;
    }
    const startsAt = new Date(`${date}T${startTime}`);
    if (Number.isNaN(startsAt.getTime())) {
      setMsg({ kind: "err", text: "Invalid date/time." });
      return;
    }
    const endsAt = endTime ? new Date(`${date}T${endTime}`) : null;

    const count = recurrence === "none" ? 1 : Math.max(1, Math.min(52, repeatCount));
    const rows = Array.from({ length: count }, (_, i) => ({
      title: title.trim(),
      description: description.trim() || null,
      starts_at: addInterval(startsAt, recurrence, i).toISOString(),
      ends_at: endsAt ? addInterval(endsAt, recurrence, i).toISOString() : null,
      location: location.trim() || null,
      meeting_url: meetingUrl.trim() || null,
      access_code: null,
      kind: kind || null,
    }));

    const sb = getSupabaseBrowser();
    if (!sb) return;
    setSaving(true);
    const { error } = await sb.from("meetings").insert(rows);
    if (error) setMsg({ kind: "err", text: error.message });
    else {
      setMsg({
        kind: "ok",
        text:
          rows.length === 1
            ? "Meeting created."
            : `${rows.length} meetings created (${recurrence}).`,
      });
      resetForm();
      await load();
    }
    setSaving(false);
  }

  async function del(m: Meeting) {
    if (!confirm(`Delete "${m.title}"?`)) return;
    const sb = getSupabaseBrowser();
    if (!sb) return;
    const { error } = await sb.from("meetings").delete().eq("id", m.id);
    if (error) setMsg({ kind: "err", text: error.message });
    else {
      setMsg({ kind: "ok", text: "Deleted." });
      await load();
    }
  }

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <Panel span="md:col-span-5" title="New meeting">
        <form onSubmit={create} className="space-y-3">
          <Field label="Title">
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} placeholder="IC voting session" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date">
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Kind">
              <select value={kind} onChange={(e) => setKind(e.target.value)} className={inputCls}>
                {KINDS.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start time">
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                onWheel={(e) => (e.currentTarget as HTMLInputElement).blur()}
                className={inputCls}
              />
            </Field>
            <Field label="End time (optional)">
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                onWheel={(e) => (e.currentTarget as HTMLInputElement).blur()}
                className={inputCls}
              />
            </Field>
          </div>
          <Field label="Location">
            <input value={location} onChange={(e) => setLocation(e.target.value)} className={inputCls} placeholder="JKP 105 · Marshall" />
          </Field>
          <Field label="Video link (Zoom / Meet / Teams)">
            <input value={meetingUrl} onChange={(e) => setMeetingUrl(e.target.value)} className={inputCls} placeholder="https://usc.zoom.us/j/..." />
          </Field>
          <Field label="Description (optional)">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className={inputCls} placeholder="Agenda, prep notes…" />
          </Field>

          {/* Recurrence */}
          <div className="pt-2 border-t hairline space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Repeat">
                <select
                  value={recurrence}
                  onChange={(e) => setRecurrence(e.target.value as typeof recurrence)}
                  className={inputCls}
                >
                  <option value="none">None (one-time)</option>
                  <option value="weekly">Every week</option>
                  <option value="biweekly">Every 2 weeks</option>
                  <option value="monthly">Every month</option>
                </select>
              </Field>
              {recurrence !== "none" && (
                <Field label={`# of ${recurrence === "monthly" ? "months" : "occurrences"}`}>
                  <input
                    type="number"
                    min={1}
                    max={52}
                    value={repeatCount}
                    onChange={(e) =>
                      setRepeatCount(Math.max(1, Math.min(52, Number(e.target.value) || 1)))
                    }
                    className={inputCls}
                  />
                </Field>
              )}
            </div>
            {recurrence !== "none" && (
              <p className="text-[11px] text-[var(--color-muted)]">
                Creates {repeatCount} individual meeting rows spaced{" "}
                {recurrence === "weekly"
                  ? "7 days"
                  : recurrence === "biweekly"
                  ? "14 days"
                  : "1 month"}{" "}
                apart. Delete or edit any single instance without affecting
                the rest.
              </p>
            )}
          </div>

          {msg && <Msg msg={msg} />}
          <button
            type="submit"
            disabled={saving}
            className="bg-[var(--color-cardinal)] text-[var(--color-paper)] px-4 py-2 text-xs uppercase font-mono hover:bg-[var(--color-cardinal-deep)] disabled:opacity-50"
          >
            {saving
              ? "Creating…"
              : recurrence === "none"
              ? "Create meeting"
              : `Create ${repeatCount} meetings`}
          </button>
        </form>
      </Panel>

      <Panel span="md:col-span-7" title={`Upcoming · ${meetings.length}`}>
        {fetching ? (
          <div className="text-sm text-[var(--color-muted)]">Loading…</div>
        ) : meetings.length === 0 ? (
          <div className="text-sm text-[var(--color-muted)]">No meetings yet.</div>
        ) : (
          <ul className="divide-y hairline">
            {meetings.map((m) => {
              const start = new Date(m.starts_at);
              const dateStr = start.toLocaleDateString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
              });
              const timeStr = start.toLocaleTimeString(undefined, {
                hour: "numeric",
                minute: "2-digit",
              });
              return (
                <li key={m.id} className="py-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[11px] font-mono uppercase text-[var(--color-cardinal)]">
                      {dateStr} · {timeStr} {m.kind ? `· ${m.kind}` : ""}
                    </div>
                    <div className="font-[family-name:var(--font-display)] text-base leading-tight">
                      {m.title}
                    </div>
                    {m.location && (
                      <div className="text-[12px] text-[var(--color-muted)]">{m.location}</div>
                    )}
                  </div>
                  <button
                    onClick={() => del(m)}
                    className="shrink-0 text-[10px] font-mono uppercase text-[var(--color-negative)] hover:bg-[var(--color-negative)] hover:text-white px-2 py-1"
                  >
                    Delete
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </div>
  );
}

const inputCls =
  "w-full border hairline bg-[var(--color-paper)] px-3 py-2 font-mono text-sm outline-none focus:border-[var(--color-cardinal)]";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="rule-label mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}

function Msg({ msg }: { msg: { kind: "ok" | "err"; text: string } }) {
  return (
    <div
      className={`text-[11px] font-mono uppercase px-3 py-2 border ${
        msg.kind === "ok"
          ? "border-[var(--color-positive)] text-[var(--color-positive)]"
          : "border-[var(--color-negative)] text-[var(--color-negative)]"
      }`}
    >
      {msg.text}
    </div>
  );
}

function Panel({
  title,
  children,
  span = "md:col-span-12",
}: {
  title?: string;
  children: React.ReactNode;
  span?: string;
}) {
  return (
    <div className={`col-span-12 ${span} border hairline bg-[var(--color-paper)]`}>
      {title && (
        <div className="px-4 md:px-5 py-3 border-b hairline bg-[var(--color-bone)]">
          <div className="rule-label">{title}</div>
        </div>
      )}
      <div className="px-4 md:px-5 py-4 md:py-5">{children}</div>
    </div>
  );
}
