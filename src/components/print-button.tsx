"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => {
        if (typeof window !== "undefined") window.print();
      }}
      className="text-[11px] font-mono uppercase px-3 py-1.5 bg-[#990000] text-white hover:bg-[#7a0000]"
    >
      Save as PDF (Ctrl/Cmd + P)
    </button>
  );
}
