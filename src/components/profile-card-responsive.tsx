"use client";

import { useEffect, useRef, useState } from "react";
import { ProfileCard, CARD_W, CARD_H, type ProfileCardData } from "@/components/profile-card";

/**
 * Responsive wrapper — the ProfileCard is rendered at its fixed 1080×1350
 * size, then scaled down via an imperatively-computed transform so it fits
 * any viewport reliably (CSS nested calc with viewport units was flaky).
 */
export function ProfileCardResponsive({
  data,
  avatarUrl,
  profileUrl,
  maxWidth = 560,
}: {
  data: ProfileCardData;
  avatarUrl: string | null;
  profileUrl: string;
  maxWidth?: number;
}) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [scale, setScale] = useState(0);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    (async () => {
      const QR = (await import("qrcode")).default;
      const dataUrl = await QR.toDataURL(profileUrl, {
        margin: 1,
        width: 512,
        color: { dark: "#0a0a0b", light: "#ffffff" },
      });
      setQrDataUrl(dataUrl);
    })();
  }, [profileUrl]);

  // Compute the largest scale that fits both the viewport width and height.
  // We cap the card's drawn size to `maxWidth` OR whatever height allows,
  // whichever is smaller.
  useEffect(() => {
    function recompute() {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      // Leave room for page padding + the share row + footer link below.
      const availableW = Math.min(vw * 0.94, maxWidth);
      const availableH = vh * 0.82;
      const scaleByW = availableW / CARD_W;
      const scaleByH = availableH / CARD_H;
      setScale(Math.min(scaleByW, scaleByH));
    }
    recompute();
    window.addEventListener("resize", recompute);
    return () => window.removeEventListener("resize", recompute);
  }, [maxWidth]);

  const displayWidth = CARD_W * scale;
  const displayHeight = CARD_H * scale;

  return (
    <div
      ref={wrapperRef}
      style={{
        width: displayWidth || "100%",
        height: displayHeight || undefined,
        position: "relative",
        boxShadow: "0 20px 60px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06)",
        borderRadius: 24,
        overflow: "hidden",
        visibility: scale === 0 ? "hidden" : "visible",
      }}
    >
      <div
        style={{
          width: CARD_W,
          height: CARD_H,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          position: "absolute",
          top: 0,
          left: 0,
        }}
      >
        <ProfileCard
          ref={() => {}}
          data={data}
          avatarDataUrl={avatarUrl}
          qrDataUrl={qrDataUrl}
          profileUrl={profileUrl}
        />
      </div>
    </div>
  );
}
