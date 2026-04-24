"use client";

import { useState } from "react";

/**
 * Compact share row displayed beneath the profile card on /m/[username].
 * Gives visitors a one-click way to copy the URL, share natively, or post
 * the profile to LinkedIn.
 */
export function PublicShareRow({
  profileUrl,
  fullName,
}: {
  profileUrl: string;
  fullName: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  async function share() {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({
          title: `${fullName} · Trojan SMIF`,
          text: `${fullName} — Trojan SMIF at USC Marshall`,
          url: profileUrl,
        });
        return;
      } catch {
        // user cancelled, fall through
      }
    }
    copy();
  }

  const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`;

  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
      <button
        type="button"
        onClick={copy}
        className="text-[11px] font-mono uppercase tracking-wider px-4 py-2 border border-[var(--color-ink)] bg-[var(--color-paper)] hover:bg-[var(--color-bone)]"
      >
        {copied ? "Copied" : "Copy link"}
      </button>
      <button
        type="button"
        onClick={share}
        className="text-[11px] font-mono uppercase tracking-wider px-4 py-2 bg-[var(--color-cardinal)] text-[var(--color-paper)] hover:bg-[var(--color-cardinal-deep)]"
      >
        Share
      </button>
      <a
        href={linkedinShareUrl}
        target="_blank"
        rel="noreferrer"
        className="text-[11px] font-mono uppercase tracking-wider px-4 py-2 border border-[var(--color-ink)] bg-[var(--color-paper)] hover:bg-[var(--color-bone)]"
      >
        Post to LinkedIn
      </a>
    </div>
  );
}
