import Link from "next/link";
import { SectionLabel } from "@/components/section-label";
import { ROSTER, byTeam, initials, FACULTY_ADVISORS } from "@/lib/roster";
import { ScrollHint } from "@/components/scroll-hint";
import { LinkedInChip } from "@/components/linkedin-icon";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export const metadata = { title: "Leadership" };
export const revalidate = 300;

type MemberLookup = {
  avatar_path: string | null;
  username: string;
  linkedin_url: string | null;
};

async function loadMemberLookup(): Promise<Map<string, MemberLookup>> {
  try {
    const admin = getSupabaseAdmin();
    const { data } = await admin
      .from("members")
      .select("username, full_name, avatar_path, linkedin_url");
    const map = new Map<string, MemberLookup>();
    (data || []).forEach((r: { full_name: string; username: string; avatar_path: string | null; linkedin_url: string | null }) => {
      map.set(r.full_name, {
        avatar_path: r.avatar_path,
        username: r.username,
        linkedin_url: r.linkedin_url,
      });
    });
    return map;
  } catch {
    return new Map();
  }
}

function publicAvatarUrl(path: string | null): string | null {
  if (!path) return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base.replace(/\/+$/, "")}/storage/v1/object/public/avatars/${path}`;
}

export default async function LeadershipPage() {
  const exec = byTeam("Executive Committee");
  const lookup = await loadMemberLookup();

  return (
    <>
      <section className="border-b hairline">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 md:py-20">
          <div className="rule-label flex items-center gap-3">
            <span className="inline-block h-px w-8 bg-[var(--color-cardinal)]" />
            Leadership
          </div>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-[clamp(2rem,6vw,3.75rem)] font-medium leading-[1.1]">
            Executive Committee<br />& Faculty Advisors.
          </h1>
          <p className="mt-8 max-w-2xl text-[var(--color-muted)] text-lg leading-relaxed">
            The Executive Committee forms the core of the Investment
            Committee alongside the Directors (see Teams). Two-thirds
            quorum is required; pitches pass by simple majority; the
            President casts tie-breakers.
          </p>
        </div>
      </section>

      {/* Executive Committee */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-14 md:py-20">
        <SectionLabel eyebrow="Executive Committee" title="Five seats. One mission." />
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {exec.map((m, i) => {
            const l = lookup.get(m.name);
            return (
              <PersonCard
                key={m.name}
                seat={`Seat 0${i + 1}`}
                name={m.name}
                role={m.role}
                linkedin={l?.linkedin_url || m.linkedin}
                avatarUrl={publicAvatarUrl(l?.avatar_path ?? null)}
                username={l?.username}
              />
            );
          })}
        </div>
      </section>

      {/* Faculty Advisors */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-14 md:py-20">
        <SectionLabel eyebrow="Faculty Advisors" title="Oversight from Marshall faculty." />
        <div className="mt-10 grid md:grid-cols-2 gap-8">
          {FACULTY_ADVISORS.map((a) => (
            <article key={a.name} className="border hairline p-8">
              <div className="flex items-start gap-5">
                <div className="h-16 w-16 shrink-0 bg-[var(--color-cardinal)] text-[var(--color-paper)] flex items-center justify-center font-[family-name:var(--font-display)] text-xl">
                  {initials(a.name)}
                </div>
                <div>
                  <h3 className="font-[family-name:var(--font-display)] text-2xl leading-tight">
                    Professor {a.name}
                  </h3>
                  <div className="rule-label mt-1">{a.title}</div>
                  <div className="text-xs text-[var(--color-muted)] mt-0.5">{a.department}</div>
                </div>
              </div>
              <p className="mt-6 text-[15px] text-[var(--color-ink)]/85 leading-relaxed">
                {a.blurb}
              </p>
              <p className="mt-3 text-[13px] text-[var(--color-muted)] leading-relaxed italic">
                {a.relation}
              </p>
              <a
                href={a.url}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex items-center gap-2 text-xs uppercase  text-[var(--color-cardinal)] border-b border-[var(--color-cardinal)] pb-1"
              >
                Marshall faculty page ↗
              </a>
            </article>
          ))}
        </div>
      </section>

      {/* Full Roster Snapshot */}
      <section id="roster" className="border-y hairline bg-[var(--color-bone)] scroll-mt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 md:py-16">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
            <SectionLabel eyebrow="Full Roster" title={`${ROSTER.length} members`} />
            <div className="font-mono text-[10px] uppercase text-[var(--color-muted)]">
              Founding cohort · 2025–2026
            </div>
          </div>
          <ScrollHint />
          <div className="border hairline bg-[var(--color-paper)] overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="bg-[var(--color-bone)]">
                <tr>
                  <Th>Name</Th>
                  <Th>Team</Th>
                  <Th>Role</Th>
                  <Th>LinkedIn</Th>
                </tr>
              </thead>
              <tbody className="divide-y hairline">
                {[...ROSTER].sort((a, b) => a.name.localeCompare(b.name)).map((m) => (
                  <tr key={m.name} className="hover:bg-[var(--color-bone)]/60">
                    <td className="px-4 md:px-5 py-3 whitespace-nowrap">{m.name}</td>
                    <td className="px-4 md:px-5 py-3 text-[var(--color-muted)] whitespace-nowrap">{m.team}</td>
                    <td className="px-4 md:px-5 py-3">{m.role}</td>
                    <td className="px-4 md:px-5 py-3">
                      <LinkedInChip linkedin={m.linkedin} name={m.name} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

    </>
  );
}

function PersonCard({
  seat,
  name,
  role,
  linkedin,
  avatarUrl,
  username,
}: {
  seat: string;
  name: string;
  role: string;
  linkedin?: string;
  avatarUrl?: string | null;
  username?: string;
}) {
  return (
    <article className="bg-[var(--color-paper)] border hairline p-6 md:p-7 relative flex flex-col">
      <div className="absolute top-0 left-0 h-[3px] w-10 bg-[var(--color-cardinal)]" />

      {/* Top eyebrow only — actions moved to the footer so the hero row stays clean */}
      <div className="rule-label">{seat}</div>

      {/* Hero: photo + name stacked */}
      <div className="mt-5 flex items-center gap-4">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt={name}
            className="h-14 w-14 shrink-0 rounded-full object-cover border border-[var(--color-cardinal)]"
          />
        ) : (
          <div className="h-14 w-14 shrink-0 bg-[var(--color-cardinal)] text-[var(--color-paper)] rounded-full flex items-center justify-center font-[family-name:var(--font-display)] text-base">
            {initials(name)}
          </div>
        )}
        <div className="min-w-0">
          <div className="font-[family-name:var(--font-display)] text-xl leading-tight">
            {name}
          </div>
        </div>
      </div>

      <p className="mt-4 text-[13px] text-[var(--color-muted)] leading-snug flex-1">{role}</p>

      {/* Footer actions — View profile + LinkedIn grouped at the bottom */}
      <div className="mt-5 pt-4 border-t hairline flex items-center justify-between gap-3">
        {username ? (
          <Link
            href={`/m/${username}`}
            className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-[var(--color-cardinal)] border-b border-[var(--color-cardinal)] pb-0.5"
          >
            View profile →
          </Link>
        ) : (
          <span />
        )}
        <LinkedInChip linkedin={linkedin} name={name} />
      </div>
    </article>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-5 py-3 text-left font-mono text-[10px] uppercase  text-[var(--color-muted)]">
      {children}
    </th>
  );
}
