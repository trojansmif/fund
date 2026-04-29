"use client";

import { useEffect, useRef, useState } from "react";
import { ProfileCard, type ProfileCardData } from "@/components/profile-card";

type Props = {
  open: boolean;
  onClose: () => void;
  data: ProfileCardData;
  avatarDataUrl: string | null;
  qrDataUrl: string | null;
  profileUrl: string;
};

/**
 * Preview + download modal. Renders the full 1080×1400 ProfileCard inside
 * a visible-but-scaled container so the user can confirm the look before
 * exporting. Keeping the element in the rendered DOM flow (vs. an
 * off-screen trick) is what finally makes html-to-image capture it
 * correctly on both Chrome and Safari.
 */
export function ProfileCardModal({
  open,
  onClose,
  data,
  avatarDataUrl,
  qrDataUrl,
  profileUrl,
}: Props) {
  const captureRef = useRef<HTMLDivElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  async function download() {
    if (!captureRef.current) return;
    setBusy(true);
    setMsg(null);
    try {
      const { toPng } = await import("html-to-image");
      const target = captureRef.current.firstElementChild as HTMLElement | null;
      if (!target) throw new Error("Card element not found");
      // Force every <img> (avatar + QR are data URLs) to fully decode
      // before snapshotting. Without this html-to-image can serialize the
      // DOM while bitmaps are still pending, producing empty image slots.
      // Also: cacheBust must stay OFF — it appends ?t=… to src, which
      // corrupts data: URLs and leaves them unrenderable in the clone.
      const imgs = Array.from(target.querySelectorAll("img"));
      await Promise.all(
        imgs.map((img) => {
          if (img.complete && img.naturalWidth > 0) return img.decode().catch(() => undefined);
          return new Promise<void>((res) => {
            img.addEventListener("load", () => res(), { once: true });
            img.addEventListener("error", () => res(), { once: true });
          }).then(() => img.decode().catch(() => undefined));
        }),
      );
      if ("fonts" in document) {
        try { await (document as Document & { fonts: { ready: Promise<unknown> } }).fonts.ready; } catch { /* ignore */ }
      }
      await new Promise((r) => requestAnimationFrame(() => r(null)));
      const dataUrl = await toPng(target, {
        pixelRatio: 2,
        width: 1080,
        height: 1400,
        backgroundColor: "#ffffff",
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `trojan-smif-${data.username}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setMsg("Downloaded.");
      setTimeout(() => setMsg(null), 2500);
    } catch (e) {
      setMsg(`Failed: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-auto"
      onClick={onClose}
    >
      <div
        className="bg-[var(--color-paper)] border hairline shadow-xl max-w-4xl w-full max-h-[92vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-3 border-b hairline bg-[var(--color-bone)] flex items-center justify-between sticky top-0 z-10">
          <div className="rule-label">Your shareable card</div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-[var(--color-muted)] hover:text-[var(--color-cardinal)] font-mono text-sm"
          >
            ✕
          </button>
        </div>

        <div className="p-4 md:p-6 flex flex-col items-center bg-[var(--color-bone)]/60">
          {/* Viewport-aware scaled preview — fits any screen size */}
          <div
            style={{
              width: "min(80vw, 360px, calc(56vh * 1080 / 1400))",
              aspectRatio: "1080 / 1400",
              position: "relative",
              boxShadow: "0 20px 50px rgba(0,0,0,0.18)",
              borderRadius: 24,
            }}
          >
            <div
              style={{
                width: 1080,
                height: 1400,
                transform:
                  "scale(calc(min(80vw, 360px, calc(56vh * 1080 / 1400)) / 1080))",
                transformOrigin: "top left",
                position: "absolute",
                top: 0,
                left: 0,
              }}
            >
              <ProfileCardInline
                data={data}
                avatarDataUrl={avatarDataUrl}
                qrDataUrl={qrDataUrl}
                profileUrl={profileUrl}
              />
            </div>
          </div>
        </div>

        {/* Un-transformed capture target — positioned below the viewport so
            it's invisible but fully rendered at real 1080×1400 dimensions.
            html-to-image reads the computed size; having no transform on
            any ancestor is what finally makes PNG export reliable. */}
        <div
          ref={captureRef}
          aria-hidden
          style={{
            position: "fixed",
            top: "200vh",
            left: 0,
            width: 1080,
            height: 1400,
            pointerEvents: "none",
          }}
        >
          <ProfileCardInline
            data={data}
            avatarDataUrl={avatarDataUrl}
            qrDataUrl={qrDataUrl}
            profileUrl={profileUrl}
          />
        </div>
        {/* keep inner ref intact */}

        <div className="px-5 py-4 border-t hairline flex flex-wrap items-center justify-between gap-3 sticky bottom-0 bg-[var(--color-paper)]">
          <div className="text-[11px] font-mono uppercase text-[var(--color-muted)]">
            1080 × 1400 · PNG · 2× retina
          </div>
          <div className="flex items-center gap-3">
            {msg && (
              <span className="text-[11px] font-mono uppercase text-[var(--color-positive)]">
                {msg}
              </span>
            )}
            <button
              onClick={onClose}
              disabled={busy}
              className="text-xs font-mono uppercase px-4 py-2 border hairline hover:bg-[var(--color-bone)] disabled:opacity-50"
            >
              Close
            </button>
            <button
              onClick={download}
              disabled={busy}
              className="text-xs font-mono uppercase px-5 py-2 bg-[var(--color-cardinal)] text-[var(--color-paper)] hover:bg-[var(--color-cardinal-deep)] disabled:opacity-50"
            >
              {busy ? "Rendering…" : "Download PNG"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileCardInline(props: {
  data: ProfileCardData;
  avatarDataUrl: string | null;
  qrDataUrl: string | null;
  profileUrl: string;
}) {
  return <ProfileCard ref={() => {}} {...props} />;
}
