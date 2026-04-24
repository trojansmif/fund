import Image from "next/image";

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Image
        src="/usc-seal.png"
        alt="USC Seal"
        width={52}
        height={52}
        className="h-12 w-12 object-contain shrink-0"
        priority
      />
      <span className="flex flex-col leading-none">
        <span
          className="text-[17px] font-semibold tracking-wide"
          style={{ fontFamily: "var(--font-display)" }}
        >
          TROJAN SMIF
        </span>
        <span
          className="text-[11px] uppercase opacity-75 mt-1.5 tracking-[0.12em]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          USC Marshall · MSF
        </span>
      </span>
    </div>
  );
}
