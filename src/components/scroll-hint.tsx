// Tiny mobile-only hint that shows above wide tables.
export function ScrollHint({ label = "Swipe to see more" }: { label?: string }) {
  return (
    <div className="md:hidden mb-2 flex items-center justify-end gap-2 font-mono text-[10px] uppercase text-[var(--color-muted)]">
      <span>{label}</span>
      <span aria-hidden className="inline-block">←→</span>
    </div>
  );
}
