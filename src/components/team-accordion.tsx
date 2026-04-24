"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { findByName, initials, type RosterEntry } from "@/lib/roster";
import { LinkedInChip } from "@/components/linkedin-icon";
import { getSupabaseBrowser } from "@/lib/supabase/client";

type MemberMeta = { avatar: string | null; username: string };

// Shared cross-accordion cache so every TeamAccordion only fetches once.
let _memberCache: Map<string, MemberMeta> | null = null;
async function fetchMemberMetaMap(): Promise<Map<string, MemberMeta>> {
  if (_memberCache) return _memberCache;
  const sb = getSupabaseBrowser();
  if (!sb) return new Map();
  const { data } = await sb
    .from("members")
    .select("full_name, username, avatar_path");
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, "");
  const map = new Map<string, MemberMeta>();
  (data || []).forEach((r: { full_name: string; username: string; avatar_path: string | null }) => {
    map.set(r.full_name, {
      avatar: r.avatar_path && base ? `${base}/storage/v1/object/public/avatars/${r.avatar_path}` : null,
      username: r.username,
    });
  });
  _memberCache = map;
  return map;
}

export function TeamAccordion({
  k,
  name,
  lead,
  blurb,
  detail,
  members,
  sectorLineup,
}: {
  k: string;
  name: string;
  lead: string;
  blurb: string;
  detail: string;
  members: RosterEntry[];
  sectorLineup?: { label: string; name: string; role: string }[];
}) {
  const count = sectorLineup ? sectorLineup.length : members.length;
  const countLabel = sectorLineup ? `${count} sectors` : `${count} member${count === 1 ? "" : "s"}`;
  const [open, setOpen] = useState(false);
  const [memberMeta, setMemberMeta] = useState<Map<string, MemberMeta>>(new Map());

  useEffect(() => {
    fetchMemberMetaMap().then(setMemberMeta);
  }, []);

  return (
    <article
      className={`border hairline bg-[var(--color-paper)] transition-colors ${
        open ? "border-[var(--color-cardinal)]" : ""
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full text-left px-5 md:px-7 py-5 md:py-6 flex items-center gap-4 md:gap-6 hover:bg-[var(--color-bone)]/60 transition-colors"
      >
        <span className="rule-label shrink-0 w-12 md:w-16">Team {k}</span>
        <span className="flex-1 min-w-0">
          <span className="block font-[family-name:var(--font-display)] text-xl md:text-2xl leading-tight">
            {name}
          </span>
          <span className="block mt-1 text-xs md:text-sm text-[var(--color-muted)] line-clamp-1 md:line-clamp-none">
            {blurb}
          </span>
        </span>
        <span className="flex items-center gap-3 md:gap-4 shrink-0">
          <span className="hidden sm:inline font-mono text-[10px] uppercase text-[var(--color-muted)]">
            {countLabel}
          </span>
          <span
            className={`inline-flex items-center justify-center w-8 h-8 border hairline font-mono text-xs transition-transform ${
              open ? "rotate-45 bg-[var(--color-cardinal)] text-[var(--color-paper)] border-[var(--color-cardinal)]" : ""
            }`}
            aria-hidden
          >
            +
          </span>
        </span>
      </button>

      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-t hairline px-5 md:px-7 py-5 md:py-6 grid grid-cols-12 gap-6 md:gap-8">
            <div className="col-span-12 md:col-span-5">
              <div className="rule-label">About</div>
              <p className="mt-2 text-[15px] leading-relaxed text-[var(--color-ink)]/85">{detail}</p>
              <div className="mt-5 rule-label">Team Lead</div>
              <p className="mt-1 text-sm">{lead}</p>
            </div>

            <div className="col-span-12 md:col-span-7">
              <div className="flex items-center justify-between mb-3">
                <div className="rule-label">{sectorLineup ? "Sector coverage" : "Lineup"}</div>
                <div className="font-mono text-[10px] uppercase text-[var(--color-muted)]">{countLabel}</div>
              </div>

              {sectorLineup ? (
                <ul className="divide-y hairline border hairline bg-[var(--color-paper)]">
                  {sectorLineup.map((s, i) => {
                    const meta = memberMeta.get(s.name);
                    return (
                      <li key={`${s.label}-${i}`} className="px-3 md:px-4 py-3 grid grid-cols-12 gap-3 items-center">
                        <div className="col-span-5 sm:col-span-3">
                          <div className="font-mono text-[10px] uppercase text-[var(--color-muted)]">Sector</div>
                          <div className="mt-0.5 text-[13px] md:text-sm">{s.label}</div>
                        </div>
                        <div className="col-span-7 sm:col-span-6 flex items-center gap-3 min-w-0">
                          <MemberAvatar name={s.name} avatarUrl={meta?.avatar ?? null} />
                          <span className="min-w-0 flex-1">
                            {meta?.username ? (
                              <Link href={`/m/${meta.username}`} className="block text-[13px] md:text-sm truncate hover:text-[var(--color-cardinal)]">
                                {s.name}
                              </Link>
                            ) : (
                              <span className="block text-[13px] md:text-sm truncate">{s.name}</span>
                            )}
                            <span className="block text-[11px] text-[var(--color-muted)] truncate">{s.role}</span>
                          </span>
                        </div>
                        <div className="col-span-12 sm:col-span-3 flex items-center justify-end gap-2">
                          {meta?.username && (
                            <Link
                              href={`/m/${meta.username}`}
                              className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-cardinal)] border-b border-[var(--color-cardinal)] pb-0.5"
                            >
                              View profile
                            </Link>
                          )}
                          <LinkedInChip
                            linkedin={findByName(s.name)?.linkedin}
                            name={s.name}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : members.length === 0 ? (
                <div className="text-sm text-[var(--color-muted)]">No members assigned yet.</div>
              ) : (
                <ul className="divide-y hairline border hairline bg-[var(--color-paper)]">
                  {members.map((m) => {
                    const meta = memberMeta.get(m.name);
                    return (
                      <li key={m.name} className="px-3 md:px-4 py-3 flex items-center gap-3">
                        <MemberAvatar name={m.name} avatarUrl={meta?.avatar ?? null} />
                        <span className="flex-1 min-w-0">
                          {meta?.username ? (
                            <Link href={`/m/${meta.username}`} className="block text-[14px] truncate hover:text-[var(--color-cardinal)]">
                              {m.name}
                            </Link>
                          ) : (
                            <span className="block text-[14px] truncate">{m.name}</span>
                          )}
                          <span className="block text-[11px] text-[var(--color-muted)] truncate">{m.role}</span>
                        </span>
                        {meta?.username && (
                          <Link
                            href={`/m/${meta.username}`}
                            className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-cardinal)] border-b border-[var(--color-cardinal)] pb-0.5 shrink-0"
                          >
                            View profile
                          </Link>
                        )}
                        <LinkedInChip linkedin={m.linkedin} name={m.name} />
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function MemberAvatar({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={name}
        className="h-8 w-8 shrink-0 rounded-full object-cover border border-[var(--color-cardinal)] block"
      />
    );
  }
  return (
    <span className="h-8 w-8 shrink-0 rounded-full bg-[var(--color-cardinal)] text-[var(--color-paper)] flex items-center justify-center font-[family-name:var(--font-display)] text-[11px]">
      {initials(name)}
    </span>
  );
}
