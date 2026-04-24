export function SectionLabel({
  eyebrow,
  title,
  subtitle,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
}) {
  const alignCls = align === "center" ? "text-center items-center" : "";
  return (
    <div className={`flex flex-col ${alignCls}`}>
      {eyebrow && (
        <div className="rule-label flex items-center gap-3">
          <span className="inline-block h-px w-8 bg-[var(--color-cardinal)]" />
          {eyebrow}
        </div>
      )}
      <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl md:text-5xl font-medium max-w-3xl leading-[1.1]">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 max-w-2xl text-[var(--color-muted)] leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
