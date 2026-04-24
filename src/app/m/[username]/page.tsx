import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { ProfileCardResponsive } from "@/components/profile-card-responsive";
import { PublicShareRow } from "@/components/public-share-row";

type PublicMember = {
  username: string;
  full_name: string;
  team: string;
  role: string;
  linkedin_url: string | null;
  avatar_path: string | null;
  resume_path: string | null;
  bio: string | null;
  grad_year: string | null;
  undergrad_school: string | null;
  prior_firm: string | null;
  post_grad_target: string | null;
  cfa_progress: string | null;
  sectors: string[] | null;
  theme_color: string | null;
  theme_font: string | null;
};

const PUBLIC_COLUMNS =
  "username, full_name, team, role, linkedin_url, avatar_path, resume_path, bio, grad_year, undergrad_school, prior_firm, post_grad_target, cfa_progress, sectors, theme_color, theme_font";

async function getMember(username: string): Promise<PublicMember | null> {
  const admin = getSupabaseAdmin();
  const clean = decodeURIComponent(username).toLowerCase();
  const { data } = await admin
    .from("members")
    .select(PUBLIC_COLUMNS)
    .eq("username", clean)
    .maybeSingle();
  return (data as PublicMember) ?? null;
}

function publicAvatarUrl(path: string | null): string | null {
  if (!path) return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base.replace(/\/+$/, "")}/storage/v1/object/public/avatars/${path}`;
}

async function signedResumeUrl(path: string | null): Promise<string | null> {
  if (!path) return null;
  const admin = getSupabaseAdmin();
  const { data } = await admin.storage
    .from("resumes")
    .createSignedUrl(path, 60 * 60 * 24);
  return data?.signedUrl ?? null;
}

export async function generateMetadata(
  { params }: { params: Promise<{ username: string }> }
): Promise<Metadata> {
  const { username } = await params;
  const m = await getMember(username);
  if (!m) return { title: "Member not found · Trojan SMIF" };
  const title = `${m.full_name} · ${m.role} · Trojan SMIF`;
  const description =
    m.bio ||
    `${m.role} on the Trojan Student Managed Investment Fund at USC Marshall.`;
  const avatar = publicAvatarUrl(m.avatar_path);
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      ...(avatar ? { images: [{ url: avatar, width: 512, height: 512, alt: m.full_name }] } : {}),
    },
    twitter: {
      card: "summary",
      title,
      description,
      ...(avatar ? { images: [avatar] } : {}),
    },
  };
}

export default async function PublicProfilePage(
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  const m = await getMember(username);
  if (!m) notFound();

  const avatar = publicAvatarUrl(m.avatar_path);
  const resume = await signedResumeUrl(m.resume_path);

  const origin = process.env.NEXT_PUBLIC_SITE_URL || "https://trojansmif.com";
  const profileUrl = `${origin}/m/${m.username}`;

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(ellipse at top, rgba(153,0,0,0.03) 0%, rgba(247,245,239,1) 45%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: "32px 16px 48px",
      }}
    >
      <ProfileCardResponsive
        data={{
          full_name: m.full_name,
          role: m.role,
          team: m.team,
          grad_year: m.grad_year,
          undergrad_school: m.undergrad_school,
          prior_firm: m.prior_firm,
          post_grad_target: m.post_grad_target,
          cfa_progress: m.cfa_progress,
          linkedin_url: m.linkedin_url,
          resume_url: resume,
          bio: m.bio,
          sectors: m.sectors,
          theme_color: m.theme_color,
          theme_font: m.theme_font,
          username: m.username,
        }}
        avatarUrl={avatar}
        profileUrl={profileUrl}
      />

      {/* Share row beneath the card */}
      <PublicShareRow profileUrl={profileUrl} fullName={m.full_name} />

      <div className="mt-6 text-[10px] font-mono uppercase tracking-wider text-[var(--color-muted)] text-center">
        <Link href="/leadership" className="hover:text-[var(--color-cardinal)]">
          ← Fund roster
        </Link>
      </div>
    </main>
  );
}
