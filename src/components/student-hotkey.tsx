"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { setAuthed } from "@/lib/auth";

export function StudentHotkey() {
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.shiftKey && (e.key === "S" || e.key === "s")) {
        e.preventDefault();
        e.stopPropagation();
        setAuthed("student", true);
        // Broadcast a navigation-intent so any lingering modal can react
        window.dispatchEvent(new CustomEvent("trojansmif:nav-to-dashboard"));
        router.push("/dashboard");
      }
    };
    window.addEventListener("keydown", onKey, { capture: true });
    return () => window.removeEventListener("keydown", onKey, { capture: true });
  }, [router]);

  return null;
}
