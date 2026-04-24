// Simple client-side auth for admin + student modes. No backend.
// Passwords are pulled from NEXT_PUBLIC env vars, with safe defaults so the
// site works out of the box. Rotate via Vercel → Settings → Environment Variables.
export const ADMIN_PASSWORD =
  process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "fight-on-2026";
export const STUDENT_PASSWORD =
  process.env.NEXT_PUBLIC_STUDENT_PASSWORD || "trojan-smif";

export const ADMIN_KEY = "trojansmif.admin.auth";
export const STUDENT_KEY = "trojansmif.student.auth";

export type Role = "admin" | "student";

export function isAuthed(role: Role): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(role === "admin" ? ADMIN_KEY : STUDENT_KEY) === "1";
  } catch {
    return false;
  }
}

export function setAuthed(role: Role, on: boolean) {
  if (typeof window === "undefined") return;
  try {
    const key = role === "admin" ? ADMIN_KEY : STUDENT_KEY;
    if (on) window.localStorage.setItem(key, "1");
    else window.localStorage.removeItem(key);
  } catch {}
}

export function checkPassword(role: Role, input: string): boolean {
  return input.trim() === (role === "admin" ? ADMIN_PASSWORD : STUDENT_PASSWORD).trim();
}
