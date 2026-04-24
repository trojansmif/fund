"use client";

import { useState } from "react";

export function WeightBars({
  rows,
  max,
  accent = "var(--color-cardinal)",
}: {
  rows: { label: string; value: number; sub?: string }[];
  max?: number;
  accent?: string;
}) {
  const [hover, setHover] = useState<string | null>(null);
  const scale = max ?? Math.max(...rows.map((r) => r.value));
  return (
    <div className="divide-y hairline">
      {rows.map((r) => {
        const isHover = hover === r.label;
        return (
          <div
            key={r.label}
            onMouseEnter={() => setHover(r.label)}
            onMouseLeave={() => setHover(null)}
            className={`grid grid-cols-12 items-center py-2.5 gap-3 px-2 -mx-2 transition-colors ${
              isHover ? "bg-[var(--color-bone)]" : ""
            }`}
          >
            <div className="col-span-5 md:col-span-4 text-sm truncate">{r.label}</div>
            <div className="col-span-5 md:col-span-6">
              <div className="h-1.5 bg-[var(--color-rule)] relative overflow-hidden">
                <div
                  className="h-full transition-[width] duration-300 ease-out"
                  style={{
                    width: `${Math.min(100, (r.value / scale) * 100)}%`,
                    background: accent,
                    opacity: isHover ? 1 : 0.85,
                  }}
                />
              </div>
              {r.sub && (
                <div className="mt-1 font-mono text-[10px] uppercase text-[var(--color-muted)]">{r.sub}</div>
              )}
            </div>
            <div className="col-span-2 text-right font-num text-sm">{r.value.toFixed(2)}%</div>
          </div>
        );
      })}
    </div>
  );
}
