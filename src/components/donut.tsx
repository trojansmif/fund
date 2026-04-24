"use client";

import { useState } from "react";

type Slice = { label: string; value: number; color: string };

export function Donut({
  data,
  size = 220,
  thickness = 28,
}: {
  data: Slice[];
  size?: number;
  thickness?: number;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const total = data.reduce((a, b) => a + b.value, 0);
  const r = (size - thickness) / 2;
  const c = size / 2;

  let angle = -Math.PI / 2;
  const arcs = data.map((d, i) => {
    const portion = d.value / total;
    const start = angle;
    const end = angle + portion * Math.PI * 2;
    angle = end;
    const large = end - start > Math.PI ? 1 : 0;
    const x1 = c + r * Math.cos(start);
    const y1 = c + r * Math.sin(start);
    const x2 = c + r * Math.cos(end);
    const y2 = c + r * Math.sin(end);
    return { i, path: `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`, ...d };
  });

  const active = hover !== null ? data[hover] : null;

  return (
    <div className="relative inline-block">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-auto">
        {arcs.map((a) => {
          const isHover = hover === a.i;
          return (
            <path
              key={a.i}
              d={a.path}
              fill="none"
              stroke={a.color}
              strokeWidth={isHover ? thickness + 4 : thickness}
              style={{ transition: "stroke-width 150ms ease-out", cursor: "pointer" }}
              onMouseEnter={() => setHover(a.i)}
              onMouseLeave={() => setHover(null)}
            />
          );
        })}
        <text
          x={c}
          y={c - 6}
          textAnchor="middle"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            textTransform: "uppercase",
            fill: "var(--color-muted)",
          }}
        >
          {active ? active.label : "Total"}
        </text>
        <text
          x={c}
          y={c + 18}
          textAnchor="middle"
          style={{ fontFamily: "var(--font-display)", fontSize: 22, fill: "var(--color-ink)" }}
        >
          {(active ? active.value : total).toFixed(1)}%
        </text>
      </svg>
    </div>
  );
}
