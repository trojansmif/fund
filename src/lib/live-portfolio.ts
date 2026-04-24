import { SEED_SNAPSHOT, type Snapshot, type Holding, type AssetClass } from "./portfolio";
import { parseCSVObjects, parseNumber } from "./csv";
import { parseXlsxFromUrl } from "./xlsx-portfolio";

// Data sources are layered — each layer overlays the previous.
//
//   Layer 1: PORTFOLIO_XLSX_URL       →  Direct .xlsx from OneDrive/SharePoint  (primary)
//   Layer 2: PORTFOLIO_HOLDINGS_CSV   →  Google Sheet "Holdings" as CSV
//   Layer 3: PORTFOLIO_META_CSV       →  Google Sheet "Meta" (key,value) as CSV
//   Layer 4: PORTFOLIO_DATA_URL       →  full Snapshot JSON (advanced)
//   Layer 5: SEED_SNAPSHOT            →  compiled-in fallback
//
// Revalidated every 15 minutes via ISR.
export async function loadSnapshot(): Promise<Snapshot> {
  const xlsxUrl = process.env.PORTFOLIO_XLSX_URL;
  const jsonUrl = process.env.PORTFOLIO_DATA_URL;
  const holdingsCsv = process.env.PORTFOLIO_HOLDINGS_CSV;
  const metaCsv = process.env.PORTFOLIO_META_CSV;

  let snapshot: Snapshot = { ...SEED_SNAPSHOT };

  if (xlsxUrl) {
    const data = await parseXlsxFromUrl(xlsxUrl);
    if (data) {
      snapshot = { ...snapshot, ...data };
      if (data.holdings && data.holdings.length) {
        snapshot.sectors = deriveSectors(snapshot.holdings);
        snapshot.assetAllocation = deriveAssetAllocation(snapshot);
      }
    }
  }

  if (jsonUrl) {
    const data = await safeFetchJson(jsonUrl);
    if (data) snapshot = { ...snapshot, ...data };
  }

  if (holdingsCsv) {
    const rows = await safeFetchCsv(holdingsCsv);
    if (rows && rows.length) {
      snapshot.holdings = rows.map(csvRowToHolding);
      snapshot.positions = snapshot.holdings.length;
      snapshot.sectors = deriveSectors(snapshot.holdings);
      snapshot.assetAllocation = deriveAssetAllocation(snapshot);
    }
  }

  if (metaCsv) {
    const rows = await safeFetchCsv(metaCsv);
    if (rows && rows.length) {
      const meta = Object.fromEntries(
        rows.map((r) => [r.key?.trim(), r.value?.trim()]).filter(([k]) => k)
      ) as Record<string, string>;
      snapshot = applyMeta(snapshot, meta);
    }
  }

  return snapshot;
}

export function sharepointUrl() {
  return (
    process.env.SHAREPOINT_DOCS_URL ??
    "https://www.microsoft.com/en-us/microsoft-365/sharepoint/collaboration"
  );
}

async function safeFetchJson(url: string) {
  try {
    const res = await fetch(url, {
      next: { revalidate: 900 },
      headers: { accept: "application/json" },
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return (await res.json()) as Partial<Snapshot>;
  } catch (err) {
    console.warn("[portfolio] json fetch failed:", err);
    return null;
  }
}

async function safeFetchCsv(url: string) {
  try {
    const res = await fetch(url, {
      next: { revalidate: 900 },
      headers: { accept: "text/csv" },
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const text = await res.text();
    return parseCSVObjects<Record<string, string>>(text);
  } catch (err) {
    console.warn("[portfolio] csv fetch failed:", err);
    return null;
  }
}

function csvRowToHolding(r: Record<string, string>): Holding {
  // Flexible column matching — accepts ticker, Ticker, TICKER, etc.
  const pick = (...keys: string[]) => {
    for (const k of keys) {
      const match = Object.keys(r).find(
        (key) => key.toLowerCase().replace(/[\s_%-]/g, "") === k.toLowerCase().replace(/[\s_%-]/g, "")
      );
      if (match) return r[match];
    }
    return "";
  };
  return {
    ticker: (pick("ticker", "symbol") || "").toUpperCase(),
    name: pick("name", "security", "company") || pick("ticker"),
    assetClass: (pick("assetclass", "asset") as AssetClass) || "US Equity",
    sector: pick("sector") || "—",
    weight: parseNumber(pick("weight", "weightpct", "weightnav", "weightofnav")),
    pnl: parseNumber(pick("pnl", "unrealized", "unrealizedpct", "pnlpct", "return")),
    thesis: pick("thesis", "note", "rationale") || "",
  };
}

function deriveSectors(holdings: Holding[]) {
  const map = new Map<string, number>();
  for (const h of holdings) {
    map.set(h.sector, (map.get(h.sector) ?? 0) + h.weight);
  }
  return Array.from(map.entries())
    .map(([sector, weight]) => ({ sector, weight: Math.round(weight * 100) / 100 }))
    .sort((a, b) => b.weight - a.weight);
}

function deriveAssetAllocation(snap: Snapshot) {
  const bands: Record<AssetClass, [number, number]> = {
    "US Equity": [45, 55],
    "International Equity": [10, 20],
    "Fixed Income": [20, 30],
    ETF: [0, 15],
    Alternatives: [0, 10],
    Cash: [2, 10],
  };
  const weights = new Map<AssetClass, number>();
  for (const h of snap.holdings) {
    weights.set(h.assetClass, (weights.get(h.assetClass) ?? 0) + h.weight);
  }
  const invested = Array.from(weights.values()).reduce((a, b) => a + b, 0);
  const cash = Math.max(0, 100 - invested);
  weights.set("Cash", cash);
  return (Object.keys(bands) as AssetClass[]).map((cls) => ({
    class: cls,
    weight: Math.round((weights.get(cls) ?? 0) * 100) / 100,
    target: bands[cls],
  }));
}

function applyMeta(snap: Snapshot, m: Record<string, string>): Snapshot {
  const num = (k: string, fallback: number) => {
    const v = m[k];
    return v ? parseNumber(v) : fallback;
  };
  const str = (k: string, fallback: string) => m[k] ?? fallback;
  return {
    ...snap,
    asOf: str("asOf", snap.asOf),
    nav: num("nav", snap.nav),
    startingAUM: num("startingAUM", snap.startingAUM),
    invested: num("invested", snap.invested),
    cash: num("cash", snap.cash),
    cashPct: num("cashPct", snap.cashPct),
    sinceInception: num("sinceInception", snap.sinceInception),
    annualizedReturn: num("annualizedReturn", snap.annualizedReturn),
    annualizedVol: num("annualizedVol", snap.annualizedVol),
    maxDrawdown: num("maxDrawdown", snap.maxDrawdown),
    sharpe: num("sharpe", snap.sharpe),
    sortino: num("sortino", snap.sortino),
    beta: num("beta", snap.beta),
    alpha: num("alpha", snap.alpha),
    trackingError: num("trackingError", snap.trackingError),
    informationRatio: num("informationRatio", snap.informationRatio),
  };
}
