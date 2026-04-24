import Image from "next/image";

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Image
        src="/usc-seal.png"
        alt="USC Seal"
        width={44}
        height={44}
        className="h-10 w-10 object-contain shrink-0"
        priority
      />
      <span className="flex flex-col leading-none">
        <span
          className="text-[14px] font-semibold"
          style={{ fontFamily: "var(--font-display)" }}
        >
          TROJAN SMIF
        </span>
        <span
          className="text-[9px] uppercase opacity-70 mt-1"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          USC Marshall · MSF
        </span>
      </span>
    </div>
  );
}
