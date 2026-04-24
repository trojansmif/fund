"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { useSupabaseSession, type MemberProfile } from "@/lib/supabase/use-session";
import { AvatarCropper } from "@/components/avatar-cropper";
import { THEME_COLORS, THEME_FONTS } from "@/lib/profile-theme";
import { ProfileCardModal } from "@/components/profile-card-modal";

export function ProfileTab() {
  const { loading, configured, user, profile, refreshProfile } = useSupabaseSession();

  // Editable profile fields (local buffer)
  const [fullName, setFullName] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [bio, setBio] = useState("");
  const [gradYear, setGradYear] = useState("");
  const [undergradSchool, setUndergradSchool] = useState("");
  const [priorFirm, setPriorFirm] = useState("");
  const [postGradTarget, setPostGradTarget] = useState("");
  const [cfaProgress, setCfaProgress] = useState("");
  const [sectors, setSectors] = useState<string[]>([]);
  const [themeColor, setThemeColor] = useState("cardinal");
  const [themeFont, setThemeFont] = useState("default");
  const [skills, setSkills] = useState("");
  const [certifications, setCertifications] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  // Avatar upload
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);

  // Resume upload
  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeMsg, setResumeMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const resumeInputRef = useRef<HTMLInputElement | null>(null);

  // PIN change
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinBusy, setPinBusy] = useState(false);
  const [pinMsg, setPinMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  // Sync local state when profile loads
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? "");
      setLinkedin(profile.linkedin_url ?? "");
      setBio(profile.bio ?? "");
      setGradYear(profile.grad_year ?? "");
      setUndergradSchool(profile.undergrad_school ?? "");
      setPriorFirm(profile.prior_firm ?? "");
      setPostGradTarget(profile.post_grad_target ?? "");
      setCfaProgress(profile.cfa_progress ?? "");
      setSectors(profile.sectors ?? []);
      setThemeColor(profile.theme_color ?? "cardinal");
      setThemeFont(profile.theme_font ?? "default");
      setSkills((profile.skills ?? []).join(", "));
      setCertifications((profile.certifications ?? []).join(", "));
    }
  }, [profile]);

  if (!configured) {
    return (
      <Card>
        <Heading eyebrow="Not configured" title="Profile is offline." />
        <p className="mt-4 text-sm text-[var(--color-muted)] leading-relaxed max-w-xl">
          Supabase environment variables aren&apos;t set in Vercel yet. The Fund
          CTO needs to finish the auth integration before profiles are
          available.
        </p>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <div className="text-sm text-[var(--color-muted)] font-mono uppercase">
          Loading profile…
        </div>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
        <Heading eyebrow="Sign in" title="Your profile is members-only." />
        <p className="mt-4 text-sm text-[var(--color-muted)] leading-relaxed max-w-xl">
          Sign in with your USC email to see and edit your member profile.
        </p>
        <Link
          href="/sign-in?next=/dashboard"
          className="mt-6 inline-flex items-center gap-2 bg-[var(--color-cardinal)] text-[var(--color-paper)] px-5 py-3 text-xs uppercase font-mono hover:bg-[var(--color-cardinal-deep)]"
        >
          Sign in with USC email →
        </Link>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card>
        <Heading eyebrow="Profile unavailable" title="Couldn't load your profile." />
        <p className="mt-4 text-sm text-[var(--color-muted)] leading-relaxed max-w-xl">
          Your row isn&apos;t resolving. Two common causes:
        </p>
        <ul className="mt-3 text-sm text-[var(--color-muted)] leading-relaxed max-w-xl list-disc pl-5 space-y-1">
          <li>
            A recent migration hasn&apos;t been applied — a new column the
            page expects doesn&apos;t exist yet. Check the browser console
            for the exact Supabase error.
          </li>
          <li>
            Your <span className="font-mono">auth_user_id</span> isn&apos;t
            linked to any <span className="font-mono">members</span> row.
            Ask an admin to reset your PIN from the Admin tab — it will
            re-link the row.
          </li>
        </ul>
        <p className="mt-4 text-xs text-[var(--color-muted)] font-mono">
          Signed in as {user.email}
        </p>
        <button
          onClick={async () => {
            const sb = getSupabaseBrowser();
            if (sb) await sb.auth.signOut();
          }}
          className="mt-6 text-xs font-mono uppercase text-[var(--color-muted)] hover:text-[var(--color-cardinal)] border-b hairline pb-1"
        >
          Sign out
        </button>
      </Card>
    );
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const sb = getSupabaseBrowser();
    if (!sb || !profile) return;

    const trimmedLinkedin = linkedin.trim();
    if (trimmedLinkedin && !/^https?:\/\/(?:www\.)?linkedin\.com\//i.test(trimmedLinkedin)) {
      setMsg({ kind: "err", text: "LinkedIn must be a linkedin.com URL." });
      return;
    }
    if (gradYear && !/^(19|20)\d{2}$/.test(gradYear.trim())) {
      setMsg({ kind: "err", text: "Class year must be a 4-digit year (e.g. 2026)." });
      return;
    }
    if (bio.length > 500) {
      setMsg({ kind: "err", text: "Bio must be 500 characters or fewer." });
      return;
    }

    setSaving(true);
    const { error } = await sb
      .from("members")
      .update({
        full_name: fullName.trim() || profile.full_name,
        linkedin_url: trimmedLinkedin || null,
        bio: bio.trim() || null,
        grad_year: gradYear.trim() || null,
        undergrad_school: undergradSchool.trim() || null,
        prior_firm: priorFirm.trim() || null,
        post_grad_target: postGradTarget || null,
        cfa_progress: cfaProgress || null,
        sectors: sectors.length ? sectors : null,
        theme_color: themeColor || null,
        theme_font: themeFont || null,
        skills: parseCsv(skills),
        certifications: parseCsv(certifications),
      })
      .eq("id", profile.id);
    if (error) {
      setMsg({ kind: "err", text: error.message });
    } else {
      setMsg({ kind: "ok", text: "Saved." });
      await refreshProfile();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("profile-updated"));
      }
    }
    setSaving(false);
  }

  // Stage a freshly-picked file into the cropper. Actual upload happens in
  // uploadAvatarBlob after the user saves the crop.
  function stageAvatarFile(file: File) {
    if (file.size > 10 * 1024 * 1024) {
      setMsg({ kind: "err", text: "Photo must be 10 MB or smaller." });
      return;
    }
    if (!/^image\//.test(file.type)) {
      setMsg({ kind: "err", text: "File must be an image (JPG, PNG, or WebP)." });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setCropSrc(reader.result);
    };
    reader.readAsDataURL(file);
  }

  async function uploadAvatarBlob(blob: Blob) {
    if (!profile || !user) return;
    const sb = getSupabaseBrowser();
    if (!sb) return;

    setAvatarUploading(true);
    setMsg(null);
    setCropSrc(null);
    try {
      // Cropper always outputs JPEG at 512×512.
      const path = `${user.id}/avatar-${Date.now()}.jpg`;

      const { error: upErr } = await sb.storage
        .from("avatars")
        .upload(path, blob, {
          contentType: "image/jpeg",
          upsert: true,
          cacheControl: "3600",
        });
      if (upErr) {
        setMsg({ kind: "err", text: upErr.message });
        return;
      }

      if (profile.avatar_path && profile.avatar_path !== path) {
        await sb.storage.from("avatars").remove([profile.avatar_path]);
      }

      const { error: dbErr } = await sb
        .from("members")
        .update({ avatar_path: path })
        .eq("id", profile.id);
      if (dbErr) {
        setMsg({ kind: "err", text: dbErr.message });
        return;
      }
      setMsg({ kind: "ok", text: "Photo updated." });
      await refreshProfile();
      // Notify other session consumers (site-header avatar, etc.)
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("profile-updated"));
      }
    } finally {
      setAvatarUploading(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  }

  async function removeAvatar() {
    if (!profile?.avatar_path) return;
    if (!confirm("Remove your profile photo?")) return;
    const sb = getSupabaseBrowser();
    if (!sb) return;
    setAvatarUploading(true);
    setMsg(null);
    await sb.storage.from("avatars").remove([profile.avatar_path]);
    const { error } = await sb.from("members").update({ avatar_path: null }).eq("id", profile.id);
    if (error) setMsg({ kind: "err", text: error.message });
    else {
      setMsg({ kind: "ok", text: "Photo removed." });
      await refreshProfile();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("profile-updated"));
      }
    }
    setAvatarUploading(false);
  }

  async function uploadResume(file: File) {
    if (!profile || !user) return;
    if (file.size > 10 * 1024 * 1024) {
      setResumeMsg({ kind: "err", text: "Resume must be 10 MB or smaller." });
      return;
    }
    const ext = (file.name.split(".").pop() || "").toLowerCase();
    const allowedExts = ["pdf", "doc", "docx"];
    const allowedMimes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedExts.includes(ext) && !allowedMimes.includes(file.type)) {
      setResumeMsg({ kind: "err", text: "Resume must be a PDF or Word document (.pdf, .doc, .docx)." });
      return;
    }
    const safeExt = allowedExts.includes(ext) ? ext : "pdf";
    const contentType =
      safeExt === "pdf"
        ? "application/pdf"
        : safeExt === "docx"
        ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        : "application/msword";
    const sb = getSupabaseBrowser();
    if (!sb) return;

    setResumeUploading(true);
    setResumeMsg(null);
    try {
      const path = `${user.id}/resume-${Date.now()}.${safeExt}`;
      const { error: upErr } = await sb.storage
        .from("resumes")
        .upload(path, file, {
          contentType,
          upsert: true,
          cacheControl: "3600",
        });
      if (upErr) {
        setResumeMsg({ kind: "err", text: upErr.message });
        return;
      }
      if (profile.resume_path && profile.resume_path !== path) {
        await sb.storage.from("resumes").remove([profile.resume_path]);
      }
      const { error: dbErr } = await sb
        .from("members")
        .update({ resume_path: path })
        .eq("id", profile.id);
      if (dbErr) {
        setResumeMsg({ kind: "err", text: dbErr.message });
        return;
      }
      setResumeMsg({ kind: "ok", text: "Resume uploaded." });
      await refreshProfile();
    } finally {
      setResumeUploading(false);
      if (resumeInputRef.current) resumeInputRef.current.value = "";
    }
  }

  async function previewResume() {
    if (!profile?.resume_path) return;
    const sb = getSupabaseBrowser();
    if (!sb) return;
    const { data, error } = await sb.storage
      .from("resumes")
      .createSignedUrl(profile.resume_path, 3600);
    if (error || !data?.signedUrl) {
      setResumeMsg({ kind: "err", text: error?.message || "Signed URL failed." });
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener");
  }

  async function removeResume() {
    if (!profile?.resume_path) return;
    if (!confirm("Remove your resume?")) return;
    const sb = getSupabaseBrowser();
    if (!sb) return;
    setResumeUploading(true);
    setResumeMsg(null);
    await sb.storage.from("resumes").remove([profile.resume_path]);
    const { error } = await sb.from("members").update({ resume_path: null }).eq("id", profile.id);
    if (error) setResumeMsg({ kind: "err", text: error.message });
    else {
      setResumeMsg({ kind: "ok", text: "Resume removed." });
      await refreshProfile();
    }
    setResumeUploading(false);
  }

  async function changePin(e: React.FormEvent) {
    e.preventDefault();
    setPinMsg(null);
    if (!/^\d{6}$/.test(newPin)) {
      setPinMsg({ kind: "err", text: "PIN must be exactly 6 digits." });
      return;
    }
    if (newPin !== confirmPin) {
      setPinMsg({ kind: "err", text: "PINs don't match." });
      return;
    }
    setPinBusy(true);
    const sb = getSupabaseBrowser();
    if (!sb) {
      setPinMsg({ kind: "err", text: "Supabase not configured." });
      setPinBusy(false);
      return;
    }
    const { error } = await sb.auth.updateUser({ password: newPin });
    if (error) {
      setPinMsg({ kind: "err", text: error.message });
    } else {
      setPinMsg({ kind: "ok", text: "PIN updated." });
      setNewPin("");
      setConfirmPin("");
    }
    setPinBusy(false);
  }

  const avatarUrl = publicAvatarUrl(profile.avatar_path);
  const initials = getInitials(profile.full_name);

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      {cropSrc && (
        <AvatarCropper
          imageSrc={cropSrc}
          onCancel={() => {
            setCropSrc(null);
            if (avatarInputRef.current) avatarInputRef.current.value = "";
          }}
          onSave={uploadAvatarBlob}
        />
      )}

      {/* Profile editor */}
      <Card span="md:col-span-8" title="Your profile">
        <form onSubmit={saveProfile} className="space-y-6">
          {/* Avatar */}
          <div className="flex flex-col sm:flex-row gap-5 sm:items-start">
            <div className="shrink-0">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt={profile.full_name}
                  className="w-24 h-24 md:w-28 md:h-28 object-cover rounded-full border-2 border-[var(--color-cardinal)]"
                />
              ) : (
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-full border-2 border-[var(--color-cardinal)] flex items-center justify-center bg-[var(--color-bone)] font-[family-name:var(--font-display)] text-3xl text-[var(--color-cardinal)]">
                  {initials}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="rule-label mb-2">Profile photo</div>
              <p className="text-xs text-[var(--color-muted)] leading-relaxed">
                JPG, PNG, or WebP. 5 MB max. Square works best. Shows on your
                leadership card and in the member directory.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) stageAvatarFile(f);
                  }}
                />
                <button
                  type="button"
                  disabled={avatarUploading}
                  onClick={() => avatarInputRef.current?.click()}
                  className="text-xs font-mono uppercase px-3 py-1.5 bg-[var(--color-cardinal)] text-[var(--color-paper)] hover:bg-[var(--color-cardinal-deep)] disabled:opacity-50"
                >
                  {avatarUploading ? "Uploading…" : avatarUrl ? "Replace photo" : "Upload photo"}
                </button>
                {profile.avatar_path && (
                  <button
                    type="button"
                    disabled={avatarUploading}
                    onClick={removeAvatar}
                    className="text-xs font-mono uppercase px-3 py-1.5 border hairline hover:bg-[var(--color-bone)] disabled:opacity-50"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Name + grad year */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-3">
              <Label>Display name</Label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                maxLength={120}
                className="input"
              />
            </div>
            <div className="sm:col-span-1">
              <Label>Class year</Label>
              <input
                value={gradYear}
                onChange={(e) => setGradYear(e.target.value.replace(/\D/g, "").slice(0, 4))}
                inputMode="numeric"
                pattern="\d{4}"
                placeholder="2026"
                className="input text-center tabular-nums"
              />
            </div>
          </div>

          {/* School + Prior firm */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Undergraduate school</Label>
              <input
                value={undergradSchool}
                onChange={(e) => setUndergradSchool(e.target.value)}
                placeholder="USC · B.S. Finance"
                maxLength={120}
                className="input"
              />
            </div>
            <div>
              <Label>Prior / current firm</Label>
              <input
                value={priorFirm}
                onChange={(e) => setPriorFirm(e.target.value)}
                placeholder="Goldman Sachs IBD · Summer 2025"
                maxLength={160}
                className="input"
              />
            </div>
          </div>

          {/* Post-grad + CFA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Post-grad target</Label>
              <input
                value={postGradTarget}
                onChange={(e) => setPostGradTarget(e.target.value)}
                placeholder="IB, S&T, HF, PE, Asset Mgmt, Corp Finance…"
                list="post-grad-options"
                maxLength={80}
                className="input"
              />
              <datalist id="post-grad-options">
                {POST_GRAD_TARGETS.map((t) => (
                  <option key={t} value={t} />
                ))}
              </datalist>
            </div>
            <div>
              <Label>CFA progress</Label>
              <select
                value={cfaProgress}
                onChange={(e) => setCfaProgress(e.target.value)}
                className="input"
              >
                <option value="">— Select one —</option>
                {CFA_STEPS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Areas of interest — tag input with autofill */}
          <div>
            <Label>
              Areas of interest
              <span className="ml-2 font-mono text-[10px] text-[var(--color-muted)]">
                {sectors.length} added · press Enter or comma to add
              </span>
            </Label>
            <TagInput value={sectors} onChange={setSectors} suggestions={SECTORS} />
          </div>

          {/* Bio */}
          <div>
            <Label>
              Bio
              <span className="ml-2 font-mono text-[10px] text-[var(--color-muted)]">
                {bio.length}/500
              </span>
            </Label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 500))}
              rows={4}
              placeholder="A short intro — background, interests, what you&apos;re focused on this year."
              className="input resize-y"
            />
          </div>

          {/* Skills + certifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>
                Skills
                <span className="ml-2 font-mono text-[10px] text-[var(--color-muted)]">
                  comma-separated
                </span>
              </Label>
              <input
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="DCF, Python, Excel, SQL, Bloomberg"
                className="input"
              />
            </div>
            <div>
              <Label>
                Certifications
                <span className="ml-2 font-mono text-[10px] text-[var(--color-muted)]">
                  comma-separated
                </span>
              </Label>
              <input
                value={certifications}
                onChange={(e) => setCertifications(e.target.value)}
                placeholder="CFA Level I, BIWS Premium, WSP"
                className="input"
              />
            </div>
          </div>

          {/* Theme — applies to the public /m/[username] profile page */}
          <div className="pt-2 border-t hairline">
            <Label>
              Public profile theme
              <span className="ml-2 font-mono text-[10px] text-[var(--color-muted)]">
                Customizes the page others see when you share your link
              </span>
            </Label>
            <div className="space-y-3">
              <div>
                <div className="text-[10px] font-mono uppercase text-[var(--color-muted)] mb-1.5">Accent color</div>
                <div className="flex flex-wrap gap-2">
                  {THEME_COLORS.map((c) => {
                    const active = themeColor === c.id;
                    return (
                      <button
                        type="button"
                        key={c.id}
                        onClick={() => setThemeColor(c.id)}
                        aria-label={c.label}
                        title={c.label}
                        className={`group flex items-center gap-2 border px-2.5 py-1.5 text-[11px] font-mono uppercase transition-colors ${
                          active ? "border-[var(--color-ink)]" : "border-[var(--color-rule)] hover:border-[var(--color-ink)]"
                        }`}
                      >
                        <span
                          className="inline-block w-5 h-5 border hairline"
                          style={{ backgroundColor: c.accent }}
                        />
                        <span>{c.label}</span>
                        {active && <span>✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase text-[var(--color-muted)] mb-1.5">Font</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {THEME_FONTS.map((f) => {
                    const active = themeFont === f.id;
                    const sampleName =
                      (profile?.full_name?.split(" ")[0] || "Sample").slice(0, 16);
                    return (
                      <button
                        type="button"
                        key={f.id}
                        onClick={() => setThemeFont(f.id)}
                        className={`text-left p-3 border transition-colors ${
                          active
                            ? "border-[var(--color-ink)] bg-[var(--color-bone)]/60"
                            : "border-[var(--color-rule)] hover:border-[var(--color-ink)]"
                        }`}
                      >
                        <div
                          className="text-2xl leading-tight"
                          style={{ fontFamily: f.displayStack }}
                        >
                          {sampleName}
                        </div>
                        <div className="mt-1 flex items-center justify-between">
                          <span className="text-[10px] font-mono uppercase text-[var(--color-muted)]">
                            {f.label}
                          </span>
                          {active && (
                            <span className="text-[10px] font-mono uppercase text-[var(--color-cardinal)]">
                              ✓ selected
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* LinkedIn */}
          <div>
            <Label>LinkedIn URL</Label>
            <input
              type="url"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              placeholder="https://www.linkedin.com/in/your-handle"
              className="input"
            />
          </div>

          {msg && (
            <div
              className={`text-[11px] font-mono uppercase px-3 py-2 border ${
                msg.kind === "ok"
                  ? "border-[var(--color-positive)] text-[var(--color-positive)]"
                  : "border-[var(--color-negative)] text-[var(--color-negative)]"
              }`}
            >
              {msg.text}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-[var(--color-cardinal)] text-[var(--color-paper)] px-6 py-2.5 text-xs uppercase font-mono hover:bg-[var(--color-cardinal-deep)] disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save profile"}
            </button>
            {profile.linkedin_url && (
              <a
                href={profile.linkedin_url}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-mono uppercase text-[var(--color-cardinal)] border-b border-[var(--color-cardinal)] pb-0.5"
              >
                Open LinkedIn ↗
              </a>
            )}
          </div>
        </form>

        <style jsx>{`
          .input {
            width: 100%;
            border: 1px solid var(--color-rule);
            background: var(--color-paper);
            padding: 0.55rem 0.75rem;
            font-family: var(--font-mono);
            font-size: 13px;
            outline: none;
          }
          .input:focus {
            border-color: var(--color-cardinal);
          }
        `}</style>
      </Card>

      {/* Account + sign-out */}
      <Card span="md:col-span-4" title="Account">
        <div className="space-y-4">
          <Field label="Email" value={user.email ?? "—"} mono />
          <Field label="Team" value={profile.team} />
          <Field label="Role" value={profile.role} />
          <Field
            label="Admin"
            value={profile.is_admin ? "Yes" : "No"}
            tone={profile.is_admin ? "positive" : "neutral"}
          />
        </div>
        <div className="mt-8 pt-6 border-t hairline">
          <button
            onClick={async () => {
              const sb = getSupabaseBrowser();
              if (sb) await sb.auth.signOut();
            }}
            className="text-xs font-mono uppercase text-[var(--color-muted)] hover:text-[var(--color-cardinal)] border-b hairline pb-1"
          >
            Sign out
          </button>
        </div>
      </Card>

      {/* Resume */}
      <Card span="md:col-span-12" title="Resume">
        <p className="text-sm text-[var(--color-muted)] leading-relaxed max-w-2xl">
          Upload one resume — PDF or Word (.pdf, .doc, .docx). Only you and
          Fund admins can download it — not publicly visible. 10 MB max.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input
            ref={resumeInputRef}
            type="file"
            accept="application/pdf,.pdf,application/msword,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) uploadResume(f);
            }}
          />
          <button
            type="button"
            disabled={resumeUploading}
            onClick={() => resumeInputRef.current?.click()}
            className="bg-[var(--color-cardinal)] text-[var(--color-paper)] px-4 py-2 text-xs uppercase font-mono hover:bg-[var(--color-cardinal-deep)] disabled:opacity-50"
          >
            {resumeUploading
              ? "Uploading…"
              : profile.resume_path
              ? "Replace resume"
              : "Upload resume"}
          </button>
          {profile.resume_path && (
            <>
              <button
                type="button"
                onClick={previewResume}
                disabled={resumeUploading}
                className="text-xs font-mono uppercase px-3 py-2 border hairline hover:bg-[var(--color-bone)] disabled:opacity-50"
              >
                Preview ↗
              </button>
              <button
                type="button"
                onClick={removeResume}
                disabled={resumeUploading}
                className="text-xs font-mono uppercase px-3 py-2 border border-[var(--color-negative)] text-[var(--color-negative)] hover:bg-[var(--color-negative)] hover:text-[var(--color-paper)] disabled:opacity-50"
              >
                Remove
              </button>
              <span className="text-[11px] font-mono uppercase text-[var(--color-muted)]">
                On file · {(profile.resume_path.split("/").pop() || "").slice(0, 40)}
              </span>
            </>
          )}
        </div>
        {resumeMsg && (
          <div
            className={`mt-3 text-[11px] font-mono uppercase px-3 py-2 border inline-block ${
              resumeMsg.kind === "ok"
                ? "border-[var(--color-positive)] text-[var(--color-positive)]"
                : "border-[var(--color-negative)] text-[var(--color-negative)]"
            }`}
          >
            {resumeMsg.text}
          </div>
        )}
      </Card>

      {/* Change PIN */}
      <Card span="md:col-span-12" title="Change your PIN">
        <p className="text-sm text-[var(--color-muted)] leading-relaxed">
          6 digits. You&apos;ll use this with your Marshall email to sign in.
          Forgot yours? Ask an admin to reset it.
        </p>
        <form onSubmit={changePin} className="mt-4 flex flex-wrap items-end gap-3">
          <label className="block">
            <span className="rule-label mb-2 block">New PIN</span>
            <input
              type="password"
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="••••••"
              autoComplete="new-password"
              className="border hairline bg-[var(--color-paper)] px-3 py-2 font-mono tracking-[0.4em] text-center text-lg outline-none focus:border-[var(--color-cardinal)] w-48"
            />
          </label>
          <label className="block">
            <span className="rule-label mb-2 block">Confirm</span>
            <input
              type="password"
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="••••••"
              autoComplete="new-password"
              className="border hairline bg-[var(--color-paper)] px-3 py-2 font-mono tracking-[0.4em] text-center text-lg outline-none focus:border-[var(--color-cardinal)] w-48"
            />
          </label>
          <button
            type="submit"
            disabled={pinBusy}
            className="bg-[var(--color-cardinal)] text-[var(--color-paper)] px-4 py-2 text-xs uppercase font-mono hover:bg-[var(--color-cardinal-deep)] disabled:opacity-50"
          >
            {pinBusy ? "Updating…" : "Update PIN"}
          </button>
          {pinMsg && (
            <div
              className={`text-[11px] font-mono uppercase px-3 py-2 border ${
                pinMsg.kind === "ok"
                  ? "border-[var(--color-positive)] text-[var(--color-positive)]"
                  : "border-[var(--color-negative)] text-[var(--color-negative)]"
              }`}
            >
              {pinMsg.text}
            </div>
          )}
        </form>
      </Card>

      {/* Share profile — last, since it's an outbound action */}
      <Card span="md:col-span-12" title="Share your profile">
        <ShareProfile username={profile.username} fullName={profile.full_name} profile={profile} />
      </Card>
    </div>
  );
}

function Heading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <>
      <div className="rule-label">{eyebrow}</div>
      <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl md:text-3xl leading-tight">{title}</h2>
    </>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <span className="rule-label mb-2 block">{children}</span>;
}

function Field({
  label,
  value,
  mono,
  tone = "neutral",
}: {
  label: string;
  value: string;
  mono?: boolean;
  tone?: "neutral" | "positive";
}) {
  return (
    <div>
      <div className="rule-label">{label}</div>
      <div
        className={`mt-1 text-[14px] break-words ${mono ? "font-mono" : ""} ${
          tone === "positive" ? "text-[var(--color-positive)]" : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function Card({
  children,
  span = "md:col-span-12",
  title,
}: {
  children: React.ReactNode;
  span?: string;
  title?: string;
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

function getInitials(name: string): string {
  const clean = name.replace(/\([^)]*\)/g, "").replace(/['"]/g, "").trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function ShareProfile({
  username,
  fullName,
  profile,
}: {
  username: string;
  fullName: string;
  profile: MemberProfile;
}) {
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");
  const [cardOpen, setCardOpen] = useState(false);
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") setOrigin(window.location.origin);
  }, []);

  const url = origin ? `${origin}/m/${username}` : `/m/${username}`;

  // Pre-bake the avatar as a data URL so html-to-image doesn't need to
  // fetch it (CORS-safe). Same for the QR code.
  useEffect(() => {
    (async () => {
      if (profile.avatar_path) {
        const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
        if (base) {
          const u = `${base.replace(/\/+$/, "")}/storage/v1/object/public/avatars/${profile.avatar_path}`;
          try {
            const res = await fetch(u);
            const blob = await res.blob();
            setAvatarDataUrl(await blobToDataUrl(blob));
          } catch {
            setAvatarDataUrl(null);
          }
        }
      } else {
        setAvatarDataUrl(null);
      }
    })();
  }, [profile.avatar_path]);

  useEffect(() => {
    if (!origin) return;
    (async () => {
      const QR = (await import("qrcode")).default;
      const dataUrl = await QR.toDataURL(url, {
        margin: 1,
        width: 512,
        color: { dark: "#0a0a0b", light: "#ffffff" },
      });
      setQrDataUrl(dataUrl);
    })();
  }, [origin, url]);

  // Mint a signed URL for the resume (private bucket) so the card's
  // Resume link actually resolves.
  useEffect(() => {
    (async () => {
      if (!profile.resume_path) {
        setResumeUrl(null);
        return;
      }
      const sb = getSupabaseBrowser();
      if (!sb) return;
      const { data } = await sb.storage
        .from("resumes")
        .createSignedUrl(profile.resume_path, 60 * 60 * 24);
      setResumeUrl(data?.signedUrl ?? null);
    })();
  }, [profile.resume_path]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  async function share() {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({
          title: `${fullName} · Trojan SMIF`,
          text: `${fullName} on the Trojan Student Managed Investment Fund at USC Marshall.`,
          url,
        });
        return;
      } catch {
        // user cancelled — fall through
      }
    }
    copy();
  }

  const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

  return (
    <div className="space-y-5">
      <p className="text-sm text-[var(--color-muted)] leading-relaxed max-w-2xl">
        Your profile has a public URL anyone can view — no sign-in required.
        Or download a themed card image with your photo, info, and a QR code
        that links back to your profile.
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <input
          readOnly
          value={url}
          onClick={(e) => (e.currentTarget as HTMLInputElement).select()}
          className="flex-1 min-w-0 border hairline bg-[var(--color-bone)]/60 px-3 py-2 font-mono text-[12px] sm:text-[13px] outline-none"
        />
        <button
          type="button"
          onClick={copy}
          className="text-xs font-mono uppercase px-3 py-2 border border-[var(--color-ink)] hover:bg-[var(--color-bone)]"
        >
          {copied ? "Copied" : "Copy link"}
        </button>
        <button
          type="button"
          onClick={share}
          className="text-xs font-mono uppercase px-3 py-2 bg-[var(--color-cardinal)] text-[var(--color-paper)] hover:bg-[var(--color-cardinal-deep)]"
        >
          Share
        </button>
        <button
          type="button"
          onClick={() => setCardOpen(true)}
          className="text-xs font-mono uppercase px-3 py-2 border border-[var(--color-cardinal)] text-[var(--color-cardinal)] hover:bg-[var(--color-cardinal)] hover:text-[var(--color-paper)]"
        >
          Download card
        </button>
        <a
          href={linkedinShareUrl}
          target="_blank"
          rel="noreferrer"
          className="text-xs font-mono uppercase px-3 py-2 border hairline hover:bg-[var(--color-bone)]"
        >
          Post to LinkedIn
        </a>
        <a
          href={`/m/${username}`}
          target="_blank"
          rel="noreferrer"
          className="text-xs font-mono uppercase text-[var(--color-cardinal)] border-b border-[var(--color-cardinal)] pb-0.5"
        >
          Preview page
        </a>
      </div>

      <ProfileCardModal
        open={cardOpen}
        onClose={() => setCardOpen(false)}
        data={{
          full_name: profile.full_name,
          role: profile.role,
          team: profile.team,
          grad_year: profile.grad_year,
          undergrad_school: profile.undergrad_school,
          prior_firm: profile.prior_firm,
          post_grad_target: profile.post_grad_target,
          cfa_progress: profile.cfa_progress,
          linkedin_url: profile.linkedin_url,
          resume_url: resumeUrl,
          bio: profile.bio,
          sectors: profile.sectors,
          theme_color: profile.theme_color,
          theme_font: profile.theme_font,
          username: profile.username,
        }}
        avatarDataUrl={avatarDataUrl}
        qrDataUrl={qrDataUrl}
        profileUrl={url}
      />
    </div>
  );
}

function TagInput({
  value,
  onChange,
  suggestions,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  suggestions: string[];
}) {
  const [draft, setDraft] = useState("");

  function commit() {
    const v = draft.trim();
    if (!v) return;
    if (value.includes(v)) {
      setDraft("");
      return;
    }
    onChange([...value, v]);
    setDraft("");
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit();
    } else if (e.key === "Backspace" && draft === "" && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  const available = suggestions.filter((s) => !value.includes(s));

  return (
    <div className="border hairline bg-[var(--color-paper)] px-3 py-2 focus-within:border-[var(--color-cardinal)]">
      <div className="flex flex-wrap gap-1.5 items-center">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono uppercase bg-[var(--color-cardinal)] text-[var(--color-paper)] tracking-wider"
          >
            {tag}
            <button
              type="button"
              onClick={() => onChange(value.filter((v) => v !== tag))}
              aria-label={`Remove ${tag}`}
              className="hover:opacity-80 ml-1"
            >
              ×
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKey}
          onBlur={commit}
          list="area-suggestions"
          placeholder={value.length === 0 ? "Type and press Enter to add…" : ""}
          className="flex-1 min-w-[160px] bg-transparent outline-none font-mono text-sm py-1"
        />
        <datalist id="area-suggestions">
          {available.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      </div>
    </div>
  );
}

function parseCsv(s: string): string[] | null {
  const parts = s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
  return parts.length ? parts : null;
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onloadend = () => {
      if (typeof r.result === "string") resolve(r.result);
      else reject(new Error("FileReader returned non-string"));
    };
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

const SECTORS = [
  "Investment Banking",
  "Sales & Trading",
  "Equity Research",
  "Asset Management",
  "Hedge Fund",
  "Private Equity",
  "Private Credit",
  "Venture Capital",
  "Wealth Management",
  "Corporate Finance",
  "FP&A",
  "Strategy Consulting",
  "Real Estate Finance",
  "Quantitative Finance",
  "Risk Management",
  "Compliance",
  "FinTech",
  "Economics / Macro Research",
  "Family Office",
  "Treasury / Capital Markets",
];

const POST_GRAD_TARGETS = [
  "Investment Banking",
  "Sales & Trading",
  "Equity Research",
  "Hedge Fund",
  "Private Equity",
  "Asset Management (Long-only)",
  "Corporate Finance",
  "Consulting",
  "Other",
];

const CFA_STEPS = [
  "None",
  "CFA Level I Candidate",
  "CFA Level II Candidate",
  "CFA Level III Candidate",
  "Passed Level I",
  "Passed Level II",
  "Passed Level III",
  "Charterholder",
];

function publicAvatarUrl(path: string | null): string | null {
  if (!path) return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base.replace(/\/+$/, "")}/storage/v1/object/public/avatars/${path}`;
}
