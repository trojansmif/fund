"use client";

import { useState } from "react";
import { initials, type RosterEntry } from "@/lib/roster";
import { LinkedInIcon, linkedInSearchUrl } from "@/components/linkedin-icon";

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
                  {sectorLineup.map((s, i) => (
                    <li key={`${s.label}-${i}`} className="px-3 md:px-4 py-3 grid grid-cols-12 gap-3 items-center">
                      <div className="col-span-5 sm:col-span-4">
                        <div className="font-mono text-[10px] uppercase text-[var(--color-muted)]">Sector</div>
                        <div className="mt-0.5 text-[13px] md:text-sm">{s.label}</div>
                      </div>
                      <div className="col-span-5 sm:col-span-7 flex items-center gap-3 min-w-0">
                        <span className="h-8 w-8 shrink-0 bg-[var(--color-cardinal)] text-[var(--color-paper)] flex items-center justify-center font-[family-name:var(--font-display)] text-[11px]">
                          {initials(s.name)}
                        </span>
                        <span className="min-w-0">
                          <span className="block text-[13px] md:text-sm truncate">{s.name}</span>
                          <span className="block text-[11px] text-[var(--color-muted)] truncate">{s.role}</span>
                        </span>
                      </div>
                      <div className="col-span-2 sm:col-span-1 flex justify-end">
                        <a
                          href={linkedInSearchUrl(s.name)}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`${s.name} on LinkedIn`}
                          className="inline-flex items-center justify-center w-7 h-7 border hairline text-[var(--color-muted)] hover:bg-[var(--color-cardinal)] hover:border-[var(--color-cardinal)] hover:text-[var(--color-paper)] transition-colors shrink-0"
                        >
                          <LinkedInIcon className="w-3 h-3" />
                        </a>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : members.length === 0 ? (
                <div className="text-sm text-[var(--color-muted)]">No members assigned yet.</div>
              ) : (
                <ul className="divide-y hairline border hairline bg-[var(--color-paper)]">
                  {members.map((m) => (
                    <li key={m.name} className="px-3 md:px-4 py-3 flex items-center gap-3">
                      <span className="h-8 w-8 shrink-0 bg-[var(--color-cardinal)] text-[var(--color-paper)] flex items-center justify-center font-[family-name:var(--font-display)] text-[11px]">
                        {initials(m.name)}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-[14px] truncate">{m.name}</span>
                        <span className="block text-[11px] text-[var(--color-muted)] truncate">{m.role}</span>
                      </span>
                      <a
                        href={m.linkedin || linkedInSearchUrl(m.name)}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`${m.name} on LinkedIn`}
                        className="inline-flex items-center justify-center w-7 h-7 border hairline text-[var(--color-muted)] hover:bg-[var(--color-cardinal)] hover:border-[var(--color-cardinal)] hover:text-[var(--color-paper)] transition-colors shrink-0"
                      >
                        <LinkedInIcon className="w-3 h-3" />
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
