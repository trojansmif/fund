"use client";

import { useMemo, useRef, useState } from "react";

type Point = { date: string; nav: number; benchmark: number };

export function PerfChart({
  data,
  height = 280,
}: {
  data: Point[];
  height?: number;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  // Use the viewBox dimensions for math; CSS stretches the SVG to fit.
  const W = 1000;
  const H = height;
  const pad = { t: 14, r: 14, b: 14, l: 14 };

  const { minY, maxY, navPath, benchPath, navArea, xFor, yFor } = useMemo(() => {
    const all = [...data.map((d) => d.nav), ...data.map((d) => d.benchmark)];
    const minY = Math.floor(Math.min(...all) / 5) * 5;
    const maxY = Math.ceil(Math.max(...all) / 5) * 5;
    const xFor = (i: number) => pad.l + (i / Math.max(1, data.length - 1)) * (W - pad.l - pad.r);
    const yFor = (v: number) => pad.t + (1 - (v - minY) / Math.max(1e-6, maxY - minY)) * (H - pad.t - pad.b);
    const navPath = data
      .map((p, i) => `${i === 0 ? "M" : "L"}${xFor(i).toFixed(1)} ${yFor(p.nav).toFixed(1)}`)
      .join(" ");
    const benchPath = data
      .map((p, i) => `${i === 0 ? "M" : "L"}${xFor(i).toFixed(1)} ${yFor(p.benchmark).toFixed(1)}`)
      .join(" ");
    const navArea = `${navPath} L${xFor(data.length - 1).toFixed(1)} ${(H - pad.b).toFixed(
      1
    )} L${xFor(0).toFixed(1)} ${(H - pad.b).toFixed(1)} Z`;
    return { minY, maxY, navPath, benchPath, navArea, xFor, yFor };
  }, [data, H]);

  const ticks = 4;
  const yTicks = Array.from({ length: ticks + 1 }, (_, k) => minY + (k / ticks) * (maxY - minY));

  function locate(clientX: number) {
    const svg = svgRef.current;
    if (!svg || data.length === 0) return;
    const rect = svg.getBoundingClientRect();
    const rel = ((clientX - rect.left) / rect.width) * W;
    const relDataX = (rel - pad.l) / (W - pad.l - pad.r);
    const idx = Math.max(0, Math.min(data.length - 1, Math.round(relDataX * (data.length - 1))));
    setHoverIdx(idx);
  }

  const active = hoverIdx !== null ? data[hoverIdx] : null;
  const activeX = hoverIdx !== null ? xFor(hoverIdx) : 0;
  const tooltipLeftPct = hoverIdx !== null ? (activeX / W) * 100 : 0;
  const tooltipOnRight = tooltipLeftPct > 65;

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="flex gap-2 md:gap-3">
        {/* Y-axis labels (HTML — stay legible at any screen width) */}
        <div className="flex flex-col justify-between py-1 pr-1 font-mono text-[10px] md:text-[11px] text-[var(--color-muted)] tabular-nums">
          {yTicks
            .slice()
            .reverse()
            .map((v, i) => (
              <span key={i}>{v.toFixed(0)}</span>
            ))}
        </div>

        {/* SVG plot */}
        <div className="relative flex-1" style={{ height }}>
          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="none"
            width="100%"
            height="100%"
            className="select-none touch-none"
            onMouseMove={(e) => locate(e.clientX)}
            onMouseLeave={() => setHoverIdx(null)}
            onTouchStart={(e) => locate(e.touches[0].clientX)}
            onTouchMove={(e) => locate(e.touches[0].clientX)}
            onTouchEnd={() => setHoverIdx(null)}
          >
            <defs>
              <linearGradient id="navGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-cardinal)" stopOpacity="0.22" />
                <stop offset="100%" stopColor="var(--color-cardinal)" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Gridlines */}
            {yTicks.map((v, i) => (
              <line
                key={i}
                x1={pad.l}
                x2={W - pad.r}
                y1={yFor(v)}
                y2={yFor(v)}
                stroke="var(--color-rule)"
                strokeDasharray={i === 0 ? "" : "2 3"}
                vectorEffect="non-scaling-stroke"
              />
            ))}

            <path d={navArea} fill="url(#navGrad)" />
            <path
              d={benchPath}
              fill="none"
              stroke="var(--color-ink-3)"
              strokeWidth={1.5}
              strokeDasharray="3 3"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d={navPath}
              fill="none"
              stroke="var(--color-cardinal)"
              strokeWidth={2}
              vectorEffect="non-scaling-stroke"
            />

            {/* Hover crosshair — vertical line is fine stretched, only the
                horizontal position matters for a 1px vertical */}
            {active && (
              <g pointerEvents="none">
                <line
                  x1={activeX}
                  x2={activeX}
                  y1={pad.t}
                  y2={H - pad.b}
                  stroke="var(--color-ink)"
                  strokeWidth={1}
                  strokeDasharray="2 3"
                  vectorEffect="non-scaling-stroke"
                />
              </g>
            )}
          </svg>

          {/* Hover markers — rendered as HTML so they stay circular at any
              container aspect ratio (the SVG uses preserveAspectRatio="none"
              which would otherwise squish SVG circles into ellipses).
              Both markers use identical dimensions (14px core + 2px border)
              so they read as a matched pair, distinguished only by color. */}
          {active && (
            <>
              <span
                aria-hidden
                className="pointer-events-none absolute rounded-full bg-[var(--color-paper)] border-2 border-[var(--color-ink)]"
                style={{
                  width: 14,
                  height: 14,
                  boxSizing: "border-box",
                  left: `calc(${(activeX / W) * 100}% - 7px)`,
                  top: `calc(${(yFor(active.benchmark) / H) * 100}% - 7px)`,
                }}
              />
              <span
                aria-hidden
                className="pointer-events-none absolute rounded-full bg-[var(--color-cardinal)] border-2 border-[var(--color-ink)]"
                style={{
                  width: 14,
                  height: 14,
                  boxSizing: "border-box",
                  left: `calc(${(activeX / W) * 100}% - 7px)`,
                  top: `calc(${(yFor(active.nav) / H) * 100}% - 7px)`,
                }}
              />
            </>
          )}

          {/* Tooltip */}
          {active && (
            <div
              className="pointer-events-none absolute top-2 z-10 bg-[var(--color-paper)] border hairline shadow-sm px-3 py-2 min-w-[160px]"
              style={{
                left: tooltipOnRight ? undefined : `calc(${tooltipLeftPct}% + 10px)`,
                right: tooltipOnRight ? `calc(${100 - tooltipLeftPct}% + 10px)` : undefined,
              }}
            >
              <div className="font-mono text-[10px] uppercase text-[var(--color-muted)]">{active.date}</div>
              <div className="mt-1 flex items-center justify-between gap-4 text-sm">
                <span className="flex items-center gap-2">
                  <span className="inline-block w-3 h-[2px] bg-[var(--color-cardinal)]" />
                  Portfolio
                </span>
                <span className="font-num">{active.nav.toFixed(2)}</span>
              </div>
              <div className="mt-1 flex items-center justify-between gap-4 text-sm">
                <span className="flex items-center gap-2">
                  <span className="inline-block w-3 h-[2px] border-t border-dashed border-[var(--color-ink-3)]" />
                  SPY
                </span>
                <span className="font-num">{active.benchmark.toFixed(2)}</span>
              </div>
              <div className="mt-1 pt-1 border-t hairline text-xs text-[var(--color-muted)] flex items-center justify-between">
                <span>Excess</span>
                <span className={`font-num ${active.nav >= active.benchmark ? "text-[var(--color-positive)]" : "text-[var(--color-negative)]"}`}>
                  {(active.nav - active.benchmark >= 0 ? "+" : "") + (active.nav - active.benchmark).toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* X-axis dates */}
      <div className="mt-2 flex items-center justify-between pl-[calc(2rem+0.5rem)] md:pl-[calc(2.5rem+0.75rem)] pr-1 font-mono text-[10px] md:text-[11px] text-[var(--color-muted)] tabular-nums">
        <span>{data[0]?.date}</span>
        <span>{data[data.length - 1]?.date}</span>
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[10px] md:text-[11px] uppercase text-[var(--color-muted)]">
        <span className="flex items-center gap-2">
          <span className="inline-block w-4 h-[2px] bg-[var(--color-cardinal)]" />
          Portfolio (indexed to 100)
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block w-4 h-[2px] border-t border-dashed border-[var(--color-ink-3)]" />
          SPY Benchmark
        </span>
        <span className="hidden sm:inline text-[var(--color-muted)]/70">· Tap/hover to inspect</span>
      </div>
    </div>
  );
}
