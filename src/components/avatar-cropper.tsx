"use client";

import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";

/**
 * Modal cropper: user drags to position, scrolls / pinches (or slider) to
 * zoom, then the selected square is rendered onto a canvas and returned
 * as a JPEG Blob at 512×512 for upload.
 */
export function AvatarCropper({
  imageSrc,
  onCancel,
  onSave,
}: {
  imageSrc: string;
  onCancel: () => void;
  onSave: (blob: Blob) => void | Promise<void>;
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setArea(pixels);
  }, []);

  async function handleSave() {
    if (!area) return;
    setSaving(true);
    try {
      const blob = await renderCrop(imageSrc, area);
      await onSave(blob);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[var(--color-paper)] border hairline shadow-lg">
        <div className="px-5 py-3 border-b hairline bg-[var(--color-bone)] flex items-center justify-between">
          <div className="rule-label">Crop your photo</div>
          <button
            onClick={onCancel}
            aria-label="Close"
            className="text-[var(--color-muted)] hover:text-[var(--color-cardinal)] font-mono text-sm"
          >
            ✕
          </button>
        </div>

        <div className="relative w-full aspect-square bg-[var(--color-ink)]/90">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="px-5 py-4 space-y-3">
          <label className="block">
            <div className="flex items-center justify-between text-[11px] font-mono uppercase text-[var(--color-muted)] mb-1">
              <span>Zoom</span>
              <span>{zoom.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min={1}
              max={4}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-[var(--color-cardinal)]"
            />
          </label>
          <p className="text-[11px] text-[var(--color-muted)] leading-relaxed">
            Drag the photo to reposition · scroll or pinch to zoom ·
            crop area is always square.
          </p>
        </div>

        <div className="px-5 py-3 border-t hairline flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="text-xs font-mono uppercase px-4 py-2 border hairline hover:bg-[var(--color-bone)] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !area}
            className="text-xs font-mono uppercase px-5 py-2 bg-[var(--color-cardinal)] text-[var(--color-paper)] hover:bg-[var(--color-cardinal-deep)] disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save photo"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Render the cropped area from the source image onto a 512×512 canvas and
// return a JPEG Blob. 512 is plenty for an avatar and keeps upload size
// modest regardless of how big the original was.
async function renderCrop(imageSrc: string, area: Area): Promise<Blob> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  const SIZE = 512;
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D not supported");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, SIZE, SIZE);
  ctx.drawImage(
    image,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    SIZE,
    SIZE
  );
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Canvas toBlob returned null"))),
      "image/jpeg",
      0.9
    );
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
