// Roster names and DB rows can drift (e.g. "Chao-Hsun (Benny) Teng" in
// the roster vs an older "Benny Teng" in members.full_name). To keep
// the View-profile link reliable, every name produces a small set of
// normalized keys; the lookup map is populated with all of them and the
// lookup tries all of them too.

function strip(s: string): string {
  return s.toLowerCase().replace(/[^a-z]/g, "");
}

export function nameKeys(name: string): string[] {
  const keys = new Set<string>();
  const trimmed = name.replace(/\s+/g, " ").trim();
  if (!trimmed) return [];
  keys.add(strip(trimmed));

  // Without parentheticals: "Chao-Hsun (Benny) Teng" -> "Chao-Hsun Teng"
  const withoutParens = trimmed.replace(/\s*\([^)]*\)\s*/g, " ").replace(/\s+/g, " ").trim();
  if (withoutParens) keys.add(strip(withoutParens));

  // Parens content + last token: "Chao-Hsun (Benny) Teng" -> "Benny Teng"
  const parens = [...trimmed.matchAll(/\(([^)]+)\)/g)].map((m) => m[1].trim()).filter(Boolean);
  const rest = withoutParens.split(/\s+/).filter(Boolean);
  const lastName = rest[rest.length - 1];
  for (const p of parens) {
    if (lastName) keys.add(strip(`${p} ${lastName}`));
  }

  return [...keys];
}
