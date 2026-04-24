"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { useSupabaseSession, type MemberProfile } from "@/lib/supabase/use-session";

type Doc = {
  id: string;
  storage_path: string;
  display_name: string;
  description: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  created_at: string;
};

type Audience =
  | { kind: "all" }
  | { kind: "team"; team: string }
  | { kind: "members"; ids: string[] };

export function DocumentsManager() {
  const { user } = useSupabaseSession();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  // Selected doc for the broadcast panel
  const [selected, setSelected] = useState<Doc | null>(null);
  const [audienceKind, setAudienceKind] = useState<"all" | "team" | "members">("all");
  const [audienceTeam, setAudienceTeam] = useState<string>("");
  const [audienceMembers, setAudienceMembers] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);

  const teams = useMemo(() => {
    const s = new Set(members.map((m) => m.team));
    return Array.from(s).sort();
  }, [members]);

  async function loadDocs() {
    const sb = getSupabaseBrowser();
    if (!sb) return;
    const { data, error } = await sb
      .from("documents")
      .select("id, storage_path, display_name, description, mime_type, size_bytes, created_at")
      .order("created_at", { ascending: false });
    if (error) setMsg({ kind: "err", text: error.message });
    else setDocs(data as Doc[]);
  }

  async function loadMembers() {
    const sb = getSupabaseBrowser();
    if (!sb) return;
    const { data } = await sb
      .from("members")
      .select("id, auth_user_id, username, full_name, team, role, linkedin_url, is_admin")
      .order("team")
      .order("full_name");
    if (data) setMembers(data as MemberProfile[]);
  }

  useEffect(() => {
    if (user) {
      loadDocs();
      loadMembers();
    }
  }, [user]);

  const onFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const sb = getSupabaseBrowser();
    if (!sb || !user) return;
    setUploading(true);
    setMsg(null);

    let firstUploaded: Doc | null = null;
    try {
      for (const file of Array.from(files)) {
        if (file.size > 25 * 1024 * 1024) {
          setMsg({ kind: "err", text: `${file.name}: larger than 25 MB — split or compress first.` });
          continue;
        }
        const stamp = Date.now();
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "_");
        const path = `${stamp}_${safeName}`;
        const { error: upErr } = await sb.storage
          .from("fund-docs")
          .upload(path, file, { contentType: file.type || undefined, upsert: false });
        if (upErr) {
          setMsg({ kind: "err", text: `${file.name}: ${upErr.message}` });
          continue;
        }
        const { data: inserted, error: metaErr } = await sb
          .from("documents")
          .insert({
            storage_path: path,
            display_name: file.name,
            mime_type: file.type || null,
            size_bytes: file.size,
            uploaded_by: user.id,
          })
          .select("id, storage_path, display_name, description, mime_type, size_bytes, created_at")
          .single();
        if (metaErr) {
          setMsg({ kind: "err", text: `metadata: ${metaErr.message}` });
        } else if (inserted && !firstUploaded) {
          firstUploaded = inserted as Doc;
        }
      }
      await loadDocs();
      // Auto-select the freshly uploaded doc so the broadcast panel is
      // primed and the admin can pick recipients without an extra click.
      if (firstUploaded) setSelected(firstUploaded);
      setMsg({
        kind: "ok",
        text: firstUploaded
          ? `Uploaded — now pick who to email it to.`
          : "Upload complete.",
      });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }, [user]);

  async function deleteDoc(doc: Doc) {
    if (!confirm(`Delete "${doc.display_name}"? This can't be undone.`)) return;
    const sb = getSupabaseBrowser();
    if (!sb) return;
    const { error: stErr } = await sb.storage.from("fund-docs").remove([doc.storage_path]);
    if (stErr) setMsg({ kind: "err", text: stErr.message });
    const { error: dbErr } = await sb.from("documents").delete().eq("id", doc.id);
    if (dbErr) setMsg({ kind: "err", text: dbErr.message });
    await loadDocs();
    if (selected?.id === doc.id) setSelected(null);
  }

  async function signedPreview(doc: Doc) {
    const sb = getSupabaseBrowser();
    if (!sb) return;
    const { data, error } = await sb.storage
      .from("fund-docs")
      .createSignedUrl(doc.storage_path, 3600);
    if (error || !data?.signedUrl) {
      setMsg({ kind: "err", text: error?.message || "Signed URL failed" });
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener");
  }

  async function shareToWhatsApp(doc: Doc) {
    const sb = getSupabaseBrowser();
    if (!sb) return;
    const { data, error } = await sb.storage
      .from("fund-docs")
      .createSignedUrl(doc.storage_path, 168 * 3600);
    if (error || !data?.signedUrl) {
      setMsg({ kind: "err", text: error?.message || "Signed URL failed" });
      return;
    }
    const text = `Trojan SMIF — ${doc.display_name}\n\nDownload: ${data.signedUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  }

  async function sendEmail() {
    if (!selected || !user) return;
    const sb = getSupabaseBrowser();
    if (!sb) return;
    setSending(true);
    setMsg(null);
    const { data: sess } = await sb.auth.getSession();
    const token = sess.session?.access_token;
    if (!token) {
      setMsg({ kind: "err", text: "Session expired — sign in again." });
      setSending(false);
      return;
    }
    const audience: Audience =
      audienceKind === "all"
        ? { kind: "all" }
        : audienceKind === "team"
        ? { kind: "team", team: audienceTeam }
        : { kind: "members", ids: audienceMembers };
    try {
      const res = await fetch("/api/documents/broadcast", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          documentId: selected.id,
          audience,
          message: note,
          signedUrlHours: 168,
        }),
      });
      const body = await res.json();
      if (!res.ok || !body.ok) {
        setMsg({ kind: "err", text: body.error || "Broadcast failed" });
      } else {
        setMsg({
          kind: "ok",
          text: `Sent to ${body.succeeded}/${body.recipients}${body.failed ? ` · ${body.failed} failed` : ""}.`,
        });
        setNote("");
      }
    } catch (e) {
      setMsg({ kind: "err", text: String(e) });
    } finally {
      setSending(false);
    }
  }

  const audienceCount = useMemo(() => {
    if (audienceKind === "all") return members.filter((m) => !!m.linkedin_url || !!m.username).length;
    if (audienceKind === "team") return members.filter((m) => m.team === audienceTeam).length;
    return audienceMembers.length;
  }, [audienceKind, audienceTeam, audienceMembers, members]);

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      {/* Upload */}
      <Panel span="md:col-span-12" title="Upload a document">
        <div
          className="border-2 border-dashed hairline p-8 text-center hover:bg-[var(--color-bone)]/50 transition-colors cursor-pointer"
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onFiles(e.dataTransfer.files);
          }}
        >
          <div className="rule-label">{uploading ? "Uploading…" : "Drop a file or click to choose"}</div>
          <div className="mt-2 text-sm text-[var(--color-muted)]">
            Max 25 MB per file. PDF, DOCX, XLSX, PNG, JPG.
          </div>
          <input
            ref={fileRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => onFiles(e.target.files)}
          />
        </div>
        {msg && (
          <div
            className={`mt-3 text-[11px] font-mono uppercase px-3 py-2 border ${
              msg.kind === "ok"
                ? "border-[var(--color-positive)] text-[var(--color-positive)]"
                : "border-[var(--color-negative)] text-[var(--color-negative)]"
            }`}
          >
            {msg.text}
          </div>
        )}
      </Panel>

      {/* Library */}
      <Panel span="md:col-span-7" title={`Library · ${docs.length}`}>
        {docs.length === 0 ? (
          <div className="text-sm text-[var(--color-muted)]">No documents yet.</div>
        ) : (
          <ul className="divide-y hairline">
            {docs.map((d) => (
              <li key={d.id} className="py-3 grid grid-cols-12 gap-3 items-start">
                <div className="col-span-12 sm:col-span-7">
                  <div className="font-[family-name:var(--font-display)] text-base leading-tight">
                    {d.display_name}
                  </div>
                  <div className="mt-1 text-[11px] font-mono uppercase text-[var(--color-muted)]">
                    {d.mime_type || "file"} · {formatBytes(d.size_bytes)} ·{" "}
                    {new Date(d.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="col-span-12 sm:col-span-5 flex flex-wrap gap-2 sm:justify-end">
                  <button
                    onClick={() => signedPreview(d)}
                    className="text-[10px] font-mono uppercase px-2 py-1 border hairline hover:bg-[var(--color-bone)]"
                  >
                    Preview
                  </button>
                  <button
                    onClick={() => setSelected(d)}
                    className={`text-[10px] font-mono uppercase px-2 py-1 ${
                      selected?.id === d.id
                        ? "bg-[var(--color-cardinal)] text-[var(--color-paper)]"
                        : "border border-[var(--color-cardinal)] text-[var(--color-cardinal)]"
                    }`}
                  >
                    Email →
                  </button>
                  <button
                    onClick={() => shareToWhatsApp(d)}
                    className="text-[10px] font-mono uppercase px-2 py-1 border hairline hover:bg-[var(--color-bone)]"
                  >
                    WhatsApp ↗
                  </button>
                  <button
                    onClick={() => deleteDoc(d)}
                    className="text-[10px] font-mono uppercase px-2 py-1 text-[var(--color-negative)] hover:bg-[var(--color-negative)] hover:text-white"
                  >
                    ×
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {/* Broadcast panel */}
      <Panel span="md:col-span-5" title="Send selected document">
        {!selected ? (
          <div className="text-sm text-[var(--color-muted)]">
            Pick a document from the Library by clicking its <span className="font-mono">Email →</span> button.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="border hairline p-3 bg-[var(--color-bone)]/50">
              <div className="rule-label">Selected</div>
              <div className="mt-1 text-sm truncate">{selected.display_name}</div>
            </div>

            <div>
              <div className="rule-label mb-2">Audience</div>
              <div className="flex flex-wrap gap-2">
                {(["all", "team", "members"] as const).map((k) => (
                  <button
                    key={k}
                    onClick={() => setAudienceKind(k)}
                    className={`text-[10px] font-mono uppercase px-3 py-1.5 ${
                      audienceKind === k
                        ? "bg-[var(--color-cardinal)] text-[var(--color-paper)]"
                        : "border hairline"
                    }`}
                  >
                    {k === "all" ? "All Fund" : k === "team" ? "By team" : "Specific people"}
                  </button>
                ))}
              </div>
            </div>

            {audienceKind === "team" && (
              <select
                value={audienceTeam}
                onChange={(e) => setAudienceTeam(e.target.value)}
                className="w-full border hairline bg-[var(--color-paper)] px-3 py-2 font-mono text-sm"
              >
                <option value="">Choose a team…</option>
                {teams.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            )}

            {audienceKind === "members" && (
              <div className="max-h-48 overflow-y-auto border hairline">
                {members.map((m) => {
                  const checked = audienceMembers.includes(m.id);
                  return (
                    <label
                      key={m.id}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-[var(--color-bone)]/50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          setAudienceMembers((prev) =>
                            e.target.checked
                              ? [...prev, m.id]
                              : prev.filter((x) => x !== m.id)
                          );
                        }}
                      />
                      <span className="flex-1 truncate">
                        {m.full_name}
                        <span className="ml-2 text-[10px] font-mono text-[var(--color-muted)] uppercase">{m.team}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            )}

            <div>
              <div className="rule-label mb-2">Note (optional)</div>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="A short note to include in the email body…"
                className="w-full border hairline bg-[var(--color-paper)] px-3 py-2 font-mono text-sm"
              />
            </div>

            <div className="text-[11px] font-mono uppercase text-[var(--color-muted)]">
              {audienceCount} recipient{audienceCount === 1 ? "" : "s"} · link expires in 7 days
            </div>

            <button
              onClick={sendEmail}
              disabled={sending || audienceCount === 0}
              className="w-full bg-[var(--color-cardinal)] text-[var(--color-paper)] px-4 py-3 text-xs uppercase font-mono hover:bg-[var(--color-cardinal-deep)] disabled:opacity-50"
            >
              {sending ? "Sending…" : `Send to ${audienceCount} via email`}
            </button>
          </div>
        )}
      </Panel>
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

function formatBytes(n: number | null): string {
  if (!n || n <= 0) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let v = n;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(v >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}
