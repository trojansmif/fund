// Client-side pitch submission store. Persists to localStorage.
// Mirrors what the user submits via the dashboard form — becomes the
// basis for a future backed-by-DB pitch system.
export type PitchRecord = {
  id: string;
  ticker: string;
  company: string;
  rec: "BUY" | "HOLD" | "SELL";
  upside: number; // percent
  entryPrice: number;
  targetPrice: number;
  thesis: string;
  risks: string;
  catalysts: string;
  analyst: string;
  status: "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED";
  createdAt: string; // ISO date
};

const KEY = "trojansmif.pitches";

export function loadPitches(): PitchRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as PitchRecord[];
  } catch {
    return [];
  }
}

export function savePitches(rows: PitchRecord[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(rows));
  } catch {}
}

export function addPitch(p: Omit<PitchRecord, "id" | "createdAt">): PitchRecord {
  const rec: PitchRecord = {
    ...p,
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
  };
  const all = loadPitches();
  all.unshift(rec);
  savePitches(all);
  return rec;
}

export function removePitch(id: string) {
  savePitches(loadPitches().filter((p) => p.id !== id));
}

export function submitPitch(id: string) {
  const all = loadPitches();
  const idx = all.findIndex((p) => p.id === id);
  if (idx < 0) return;
  all[idx] = { ...all[idx], status: "SUBMITTED" };
  savePitches(all);
}

export function buildMailto(p: PitchRecord): string {
  const subject = `SMIF Pitch — ${p.ticker} (${p.rec}) · ${p.company}`;
  const body =
    `Analyst: ${p.analyst}\n` +
    `Ticker: ${p.ticker}\n` +
    `Company: ${p.company}\n` +
    `Recommendation: ${p.rec}\n` +
    `Entry price: ${p.entryPrice.toFixed(2)}\n` +
    `Target price: ${p.targetPrice.toFixed(2)}\n` +
    `Upside: ${p.upside.toFixed(2)}%\n\n` +
    `-- Thesis --\n${p.thesis}\n\n` +
    `-- Catalysts --\n${p.catalysts}\n\n` +
    `-- Risks --\n${p.risks}\n\n` +
    `Submitted via Trojan SMIF dashboard · ${new Date(p.createdAt).toLocaleString()}`;
  return `mailto:connorchisick@gmail.com?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;
}
