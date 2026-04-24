// Shared theme catalog used by both the profile editor (pickers) and the
// public /m/[username] renderer. Keep ids stable — they're stored in the DB.

export type ThemeColor = {
  id: string;
  label: string;
  /** Accent used for rules, buttons, chip borders. */
  accent: string;
  /** Slightly darker variant for button hover. */
  accentDeep: string;
  /** Contrast text to place on the accent color. */
  onAccent: string;
};

export type ThemeFont = {
  id: string;
  label: string;
  displayStack: string;
  bodyStack: string;
};

export const THEME_COLORS: ThemeColor[] = [
  { id: "cardinal", label: "USC Cardinal", accent: "#990000", accentDeep: "#7a0000", onAccent: "#fbfaf6" },
  { id: "gold",     label: "USC Gold",      accent: "#ffcc00", accentDeep: "#d9ae00", onAccent: "#0a0a0b" },
  { id: "ink",      label: "Midnight",      accent: "#0a0a0b", accentDeep: "#000000", onAccent: "#fbfaf6" },
  { id: "grey",     label: "Grey",          accent: "#6b7280", accentDeep: "#4b5563", onAccent: "#fbfaf6" },
  { id: "white",    label: "White",         accent: "#ffffff", accentDeep: "#e5e7eb", onAccent: "#0a0a0b" },
];

export const THEME_FONTS: ThemeFont[] = [
  {
    id: "default",
    label: "Default (site)",
    displayStack: "var(--font-display), serif",
    bodyStack: "inherit",
  },
  {
    id: "serif",
    label: "Editorial serif",
    displayStack: '"Playfair Display", "EB Garamond", Georgia, serif',
    bodyStack: 'Georgia, "Times New Roman", serif',
  },
  {
    id: "mono",
    label: "Monospace",
    displayStack: '"JetBrains Mono", ui-monospace, monospace',
    bodyStack: '"JetBrains Mono", ui-monospace, monospace',
  },
  {
    id: "sans",
    label: "Modern sans",
    displayStack: 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif',
    bodyStack: 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif',
  },
];

export function resolveTheme(color: string | null | undefined, font: string | null | undefined) {
  const c = THEME_COLORS.find((t) => t.id === color) || THEME_COLORS[0];
  const f = THEME_FONTS.find((t) => t.id === font) || THEME_FONTS[0];
  return { color: c, font: f };
}
