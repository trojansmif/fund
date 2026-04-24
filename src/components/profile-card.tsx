"use client";

import { forwardRef } from "react";
import type { CSSProperties } from "react";
import { resolveTheme } from "@/lib/profile-theme";

export type ProfileCardData = {
  full_name: string;
  role: string;
  team: string;
  grad_year: string | null;
  undergrad_school: string | null;
  prior_firm: string | null;
  post_grad_target: string | null;
  cfa_progress: string | null;
  linkedin_url: string | null;
  resume_url: string | null;
  bio: string | null;
  sectors: string[] | null;
  theme_color: string | null;
  theme_font: string | null;
  username: string;
};

const CARD_W = 1080;
const CARD_H = 1400;

const INK = "#0a0a0b";
const PAPER = "#ffffff";
const BONE = "#f7f5ef";
const MUTED = "rgba(10,10,11,0.58)";
const FAINT = "rgba(10,10,11,0.3)";
const RULE = "rgba(10,10,11,0.12)";

/**
 * Editorial profile card — numbered section dividers, strong typographic
 * hierarchy, accent used sparingly. White canvas with a solid accent
 * header band. Used both as the shareable /m/[username] page and the
 * downloaded PNG artifact.
 */
export const ProfileCard = forwardRef<HTMLDivElement, {
  data: ProfileCardData;
  avatarDataUrl: string | null;
  qrDataUrl: string | null;
  profileUrl: string;
}>(function ProfileCard({ data, avatarDataUrl, qrDataUrl, profileUrl }, ref) {
  const { color, font } = resolveTheme(data.theme_color, data.theme_font);
  const initials = getInitials(data.full_name);

  const isLight = isLightColor(color.accent);
  const accent = isLight ? INK : color.accent;
  const accentDeep = isLight ? "#1b1b1e" : color.accentDeep;
  const onAccent = isLight ? "#ffffff" : color.onAccent;

  const displayFamily = font.displayStack;
  const bodyFamily = font.bodyStack === "inherit" ? "Georgia, 'Times New Roman', serif" : font.bodyStack;

  const shell: CSSProperties = {
    width: CARD_W,
    height: CARD_H,
    background: PAPER,
    color: INK,
    fontFamily: bodyFamily,
    borderRadius: 20,
    position: "relative",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  };

  const facts: { label: string; value: string }[] = [];
  if (data.grad_year) facts.push({ label: "Class", value: data.grad_year });
  if (data.undergrad_school) facts.push({ label: "Undergrad", value: data.undergrad_school });
  if (data.prior_firm) facts.push({ label: "Experience", value: data.prior_firm });
  if (data.post_grad_target) facts.push({ label: "Post-grad target", value: data.post_grad_target });
  if (data.cfa_progress) facts.push({ label: "CFA", value: data.cfa_progress });

  const hasSectors = data.sectors && data.sectors.length > 0;
  const hasLinks = data.linkedin_url || data.resume_url;

  let sectionN = 0;
  const nextN = () => String(++sectionN).padStart(2, "0");

  return (
    <div ref={ref} style={shell}>
      {/* ACCENT HEADER BAND */}
      <div
        style={{
          background: accent,
          color: onAccent,
          padding: "28px 56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/usc-seal.png"
            alt="USC"
            width={72}
            height={72}
            style={{ width: 72, height: 72, filter: isLight ? "none" : "brightness(0) invert(1)" }}
          />
          <div style={{ lineHeight: 1.1 }}>
            <div style={{ fontSize: 26, fontFamily: '"JetBrains Mono", monospace', letterSpacing: 3.5, textTransform: "uppercase", fontWeight: 700 }}>
              Trojan SMIF
            </div>
            <div style={{ fontSize: 14, fontFamily: '"JetBrains Mono", monospace', letterSpacing: 2.2, textTransform: "uppercase", opacity: 0.78, marginTop: 6 }}>
              USC Marshall · MSF
            </div>
          </div>
        </div>
        <div style={{ textAlign: "right", maxWidth: 360, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
          <div style={{
            fontSize: 16,
            fontFamily: '"JetBrains Mono", monospace',
            letterSpacing: 1.8,
            textTransform: "uppercase",
            lineHeight: 1.3,
            fontWeight: 700,
          }}>
            {data.role}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ padding: "44px 56px 36px", display: "flex", flexDirection: "column", gap: 30, flex: 1, minHeight: 0 }}>

        {/* HERO */}
        <section style={{ display: "flex", alignItems: "center", gap: 36 }}>
          <div style={{ flexShrink: 0, position: "relative" }}>
            {avatarDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarDataUrl}
                alt={data.full_name}
                width={200}
                height={200}
                style={{
                  width: 200,
                  height: 200,
                  borderRadius: "50%",
                  objectFit: "cover",
                  display: "block",
                  boxShadow: `0 0 0 4px ${PAPER}, 0 0 0 6px ${accent}`,
                }}
              />
            ) : (
              <div style={{
                width: 200,
                height: 200,
                borderRadius: "50%",
                background: BONE,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 84,
                fontFamily: displayFamily,
                color: accent,
                fontWeight: 700,
                boxShadow: `0 0 0 4px ${PAPER}, 0 0 0 6px ${accent}`,
              }}>
                {initials}
              </div>
            )}
          </div>

          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 14, fontFamily: '"JetBrains Mono", monospace', letterSpacing: 2, textTransform: "uppercase", color: accent, fontWeight: 700, marginBottom: 12 }}>
              Member profile
            </div>
            <h1 style={{
              fontFamily: displayFamily,
              fontSize: 92,
              lineHeight: 0.96,
              fontWeight: 700,
              letterSpacing: "-0.025em",
              margin: 0,
              color: INK,
            }}>
              {data.full_name}
            </h1>
            <div style={{
              marginTop: 18,
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
            }}>
              <span style={{
                display: "inline-block",
                width: 28,
                height: 3,
                background: accent,
              }} />
              <span style={{
                fontSize: 18,
                fontFamily: '"JetBrains Mono", monospace',
                letterSpacing: 2.5,
                textTransform: "uppercase",
                color: accent,
                fontWeight: 700,
              }}>
                {data.team}
              </span>
            </div>
          </div>
        </section>

        {/* SECTIONS */}
        {facts.length > 0 && (
          <Section n={nextN()} label="Credentials" accent={accent}>
            <div style={{
              display: "grid",
              gridTemplateColumns: `repeat(${Math.min(facts.length, 3)}, 1fr)`,
              columnGap: 32,
              rowGap: 18,
            }}>
              {facts.slice(0, 6).map((f) => (
                <div key={f.label}>
                  <div style={{
                    fontSize: 11,
                    fontFamily: '"JetBrains Mono", monospace',
                    letterSpacing: 1.8,
                    textTransform: "uppercase",
                    color: FAINT,
                    marginBottom: 6,
                    fontWeight: 600,
                  }}>
                    {f.label}
                  </div>
                  <div style={{ fontSize: 22, lineHeight: 1.25, color: INK, fontWeight: 500, fontFamily: displayFamily }}>
                    {f.value}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {data.bio && (
          <Section n={nextN()} label="About" accent={accent}>
            <p style={{
              fontSize: 22,
              lineHeight: 1.55,
              color: INK,
              margin: 0,
              whiteSpace: "pre-wrap",
              fontFamily: bodyFamily,
              fontStyle: "italic",
            }}>
              <span style={{ fontSize: 40, fontFamily: displayFamily, color: accent, fontWeight: 700, lineHeight: 0.5, verticalAlign: "text-bottom", marginRight: 4 }}>“</span>
              {truncate(data.bio, 260)}
              <span style={{ fontSize: 40, fontFamily: displayFamily, color: accent, fontWeight: 700, lineHeight: 0.5, verticalAlign: "text-bottom", marginLeft: 2 }}>”</span>
            </p>
          </Section>
        )}

        {hasSectors && (
          <Section n={nextN()} label="Areas of interest" accent={accent}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {data.sectors!.slice(0, 8).map((s) => (
                <span
                  key={s}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "10px 18px",
                    fontSize: 15,
                    fontFamily: '"JetBrains Mono", monospace',
                    letterSpacing: 0.8,
                    textTransform: "uppercase",
                    background: BONE,
                    border: `1.5px solid ${accent}`,
                    borderRadius: 999,
                    color: accent,
                    fontWeight: 700,
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          </Section>
        )}

        {hasLinks && (
          <Section n={nextN()} label="Connect" accent={accent}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              {data.linkedin_url && (
                <a
                  href={data.linkedin_url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "18px 28px",
                    fontSize: 17,
                    fontFamily: '"JetBrains Mono", monospace',
                    letterSpacing: 1.5,
                    textTransform: "uppercase",
                    background: accent,
                    color: onAccent,
                    borderRadius: 10,
                    textDecoration: "none",
                    fontWeight: 700,
                    boxShadow: `0 4px 12px ${rgba(accent, 0.25)}`,
                  }}
                >
                  <LinkedInMark color={onAccent} />
                  LinkedIn
                </a>
              )}
              {data.resume_url && (
                <a
                  href={data.resume_url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "18px 28px",
                    fontSize: 17,
                    fontFamily: '"JetBrains Mono", monospace',
                    letterSpacing: 1.5,
                    textTransform: "uppercase",
                    border: `2px solid ${accent}`,
                    color: accent,
                    background: PAPER,
                    borderRadius: 10,
                    textDecoration: "none",
                    fontWeight: 700,
                  }}
                >
                  <ResumeIcon color={accent} />
                  Resume
                </a>
              )}
            </div>
          </Section>
        )}

        {/* FOOTER — pinned to bottom */}
        <div style={{ marginTop: "auto" }}>
          <div style={{ height: 2, background: accent, marginBottom: 22 }} />
          <footer style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontSize: 10,
                fontFamily: '"JetBrains Mono", monospace',
                letterSpacing: 2,
                textTransform: "uppercase",
                color: FAINT,
                marginBottom: 6,
                fontWeight: 600,
              }}>
                Scan or visit
              </div>
              <div style={{
                fontSize: 18,
                fontFamily: '"JetBrains Mono", monospace',
                color: INK,
                wordBreak: "break-all",
                fontWeight: 600,
              }}>
                {profileUrl.replace(/^https?:\/\//, "")}
              </div>
            </div>
            {qrDataUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrDataUrl}
                alt="Scan for profile"
                width={110}
                height={110}
                style={{ width: 110, height: 110, display: "block", border: `2px solid ${accent}`, borderRadius: 8, padding: 4, background: PAPER }}
              />
            )}
          </footer>
        </div>
      </div>

      {/* DEEP ACCENT BOTTOM STRIPE */}
      <div style={{ height: 10, background: accentDeep, flexShrink: 0 }} />
    </div>
  );
});

export { CARD_W, CARD_H };

function Section({
  n,
  label,
  accent,
  children,
}: {
  n: string;
  label: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      {/* Numbered divider */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
        <span style={{
          fontSize: 12,
          fontFamily: '"JetBrains Mono", monospace',
          letterSpacing: 2,
          textTransform: "uppercase",
          fontWeight: 700,
          background: accent,
          color: "#ffffff",
          padding: "5px 10px",
          borderRadius: 4,
        }}>
          {n}
        </span>
        <span style={{
          fontSize: 14,
          fontFamily: '"JetBrains Mono", monospace',
          letterSpacing: 3,
          textTransform: "uppercase",
          color: INK,
          fontWeight: 700,
        }}>
          {label}
        </span>
        <div style={{ flex: 1, height: 1, background: RULE }} />
      </div>
      {children}
    </section>
  );
}

function LinkedInMark({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={color}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.024-3.037-1.852-3.037-1.854 0-2.136 1.445-2.136 2.939v5.667H9.35V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.268 2.37 4.268 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.063 2.063 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.543C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function ResumeIcon({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="14 3 14 9 20 9" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="8" y1="13" x2="16" y2="13" strokeLinecap="round" />
      <line x1="8" y1="17" x2="16" y2="17" strokeLinecap="round" />
    </svg>
  );
}

function getInitials(name: string): string {
  const clean = name.replace(/\([^)]*\)/g, "").replace(/['"]/g, "").trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function truncate(s: string, n: number) {
  return s.length <= n ? s : s.slice(0, n - 1).trimEnd() + "…";
}

function isLightColor(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.72;
}

function rgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
