import { ReactNode } from "react";

export function KPI({
  label,
  value,
  delta,
  hint,
  tone = "neutral",
}: {
  label: string;
  value: ReactNode;
  delta?: string;
  hint?: string;
  tone?: "neutral" | "positive" | "negative";
}) {
  const tintClass =
    tone === "positive"
      ? "text-[var(--color-positive)]"
      : tone === "negative"
      ? "text-[var(--color-negative)]"
      : "text-[var(--color-ink)]";

  return (
    <div className="relative border hairline bg-[var(--color-paper)] p-5">
      <div className="rule-label">{label}</div>
      <div className={`mt-3 font-[family-name:var(--font-display)] text-3xl md:text-4xl font-medium ${tintClass}`}>
        <span className="font-num">{value}</span>
      </div>
      {delta && (
        <div className={`mt-1 font-num text-xs ${tintClass}`}>{delta}</div>
      )}
      {hint && <div className="mt-2 text-xs text-[var(--color-muted)]">{hint}</div>}
      <div className="absolute top-0 left-0 h-[3px] w-10 bg-[var(--color-cardinal)]" />
    </div>
  );
}
