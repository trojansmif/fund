"use client";

import { useState } from "react";

export function ReportButton({ defaultDate }: { defaultDate: string }) {
  const [date, setDate] = useState(defaultDate);
  const [open, setOpen] = useState(false);

  function generate() {
    const url = `/portfolio/report?date=${encodeURIComponent(date)}`;
    // Open in a new tab so the user can hit Cmd/Ctrl+P → Save as PDF.
    window.open(url, "_blank", "noopener");
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 border border-[var(--color-ink)] px-5 py-2 text-xs uppercase hover:bg-[var(--color-bone)]"
      >
        Download report
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-[calc(100%+6px)] z-40 w-[280px] bg-[var(--color-paper)] border hairline shadow-md p-4">
            <div className="rule-label mb-2">Report date</div>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border hairline bg-[var(--color-paper)] px-3 py-2 font-mono text-sm outline-none focus:border-[var(--color-cardinal)]"
            />
            <p className="mt-2 text-[11px] text-[var(--color-muted)] leading-relaxed">
              Generates a PDF-ready report as of the selected date. Use your
              browser&apos;s <span className="font-mono">Save as PDF</span>{" "}
              option (Ctrl/Cmd + P) on the report page.
            </p>
            <div className="mt-3 flex items-center gap-2 justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-[10px] font-mono uppercase px-3 py-1.5 border hairline hover:bg-[var(--color-bone)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={generate}
                className="text-[10px] font-mono uppercase px-3 py-1.5 bg-[var(--color-cardinal)] text-[var(--color-paper)] hover:bg-[var(--color-cardinal-deep)]"
              >
                Generate
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
