"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";

type Ann = {
  id: string;
  title: string;
  body: string;
  tag: string | null;
  pinned: boolean;
  created_at: string;
};

const TAGS = ["GENERAL", "PITCH", "REVIEW", "EVENT", "URGENT", "RESOURCE", "COMPETITION"];

export function AnnouncementsAdmin() {
  const [items, setItems] = useState<Ann[]>([]);
  const [fetching, setFetching] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tag, setTag] = useState<string>("GENERAL");
  const [pinned, setPinned] = useState(false);
  const [saving, setSaving] = useState(false);

  async function load() {
    const sb = getSupabaseBrowser();
    if (!sb) return;
    setFetching(true);
    const { data, error } = await sb
      .from("announcements")
      .select("id, title, body, tag, pinned, created_at")
      .order("pinned", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) setMsg({ kind: "err", text: error.message });
    else setItems((data as Ann[]) ?? []);
    setFetching(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function post(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!title.trim() || !body.trim()) {
      setMsg({ kind: "err", text: "Title and body required." });
      return;
    }
    const sb = getSupabaseBrowser();
    if (!sb) return;
    setSaving(true);
    const { error } = await sb.from("announcements").insert({
      title: title.trim(),
      body: body.trim(),
      tag: tag || null,
      pinned,
    });
    if (error) setMsg({ kind: "err", text: error.message });
    else {
      setMsg({ kind: "ok", text: "Posted to the Fund." });
      setTitle("");
      setBody("");
      setPinned(false);
      setTag("GENERAL");
      await load();
    }
    setSaving(false);
  }

  async function togglePin(a: Ann) {
    const sb = getSupabaseBrowser();
    if (!sb) return;
    const { error } = await sb
      .from("announcements")
      .update({ pinned: !a.pinned })
      .eq("id", a.id);
    if (error) setMsg({ kind: "err", text: error.message });
    else await load();
  }

  async function del(a: Ann) {
    if (!confirm(`Delete "${a.title}"?`)) return;
    const sb = getSupabaseBrowser();
    if (!sb) return;
    const { error } = await sb.from("announcements").delete().eq("id", a.id);
    if (error) setMsg({ kind: "err", text: error.message });
    else await load();
  }

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <Panel span="md:col-span-5" title="Post to the Fund">
        <p className="text-sm text-[var(--color-muted)] leading-relaxed mb-4">
          Broadcasts instantly to every signed-in member&apos;s Home tab. No
          email delivery involved — bypasses tenant quarantine.
        </p>
        <form onSubmit={post} className="space-y-3">
          <Field label="Title">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              className={inputCls}
              placeholder="IC vote Monday 6pm"
            />
          </Field>
          <Field label="Body">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              maxLength={1000}
              className={inputCls}
              placeholder="Full message — readable by anyone on the Fund."
            />
          </Field>
          <div className="grid grid-cols-2 gap-3 items-end">
            <Field label="Tag">
              <select value={tag} onChange={(e) => setTag(e.target.value)} className={inputCls}>
                {TAGS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>
            <label className="flex items-center gap-2 text-sm select-none h-[40px]">
              <input
                type="checkbox"
                checked={pinned}
                onChange={(e) => setPinned(e.target.checked)}
              />
              <span>Pin to top</span>
            </label>
          </div>
          {msg && <Msg msg={msg} />}
          <button
            type="submit"
            disabled={saving}
            className="bg-[var(--color-cardinal)] text-[var(--color-paper)] px-5 py-2.5 text-xs uppercase font-mono hover:bg-[var(--color-cardinal-deep)] disabled:opacity-50"
          >
            {saving ? "Posting…" : "Post to Fund"}
          </button>
        </form>
      </Panel>

      <Panel span="md:col-span-7" title={`Recent · ${items.length}`}>
        {fetching ? (
          <div className="text-sm text-[var(--color-muted)]">Loading…</div>
        ) : items.length === 0 ? (
          <div className="text-sm text-[var(--color-muted)]">
            Nothing posted yet.
          </div>
        ) : (
          <ul className="divide-y hairline">
            {items.map((a) => (
              <li key={a.id} className="py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="tag">{a.tag || "GENERAL"}</span>
                      {a.pinned && (
                        <span className="text-[10px] font-mono uppercase bg-[var(--color-cardinal)] text-[var(--color-paper)] px-2 py-0.5">
                          Pinned
                        </span>
                      )}
                      <span className="text-[10px] font-mono uppercase text-[var(--color-muted)]">
                        {new Date(a.created_at).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="mt-1 font-[family-name:var(--font-display)] text-base leading-tight">
                      {a.title}
                    </div>
                    <div className="mt-1 text-sm text-[var(--color-muted)] whitespace-pre-wrap">
                      {a.body}
                    </div>
                  </div>
                  <div className="shrink-0 flex flex-col gap-1">
                    <button
                      onClick={() => togglePin(a)}
                      className="text-[10px] font-mono uppercase px-2 py-1 border hairline hover:bg-[var(--color-bone)]"
                    >
                      {a.pinned ? "Unpin" : "Pin"}
                    </button>
                    <button
                      onClick={() => del(a)}
                      className="text-[10px] font-mono uppercase px-2 py-1 text-[var(--color-negative)] hover:bg-[var(--color-negative)] hover:text-white"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
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
