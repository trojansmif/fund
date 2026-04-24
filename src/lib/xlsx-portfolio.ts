import ExcelJS from "exceljs";
import type { Snapshot, Holding, AssetClass } from "./portfolio";

// Fetches an .xlsx file from OneDrive/SharePoint (or any HTTPS URL returning
// the raw binary) and extracts the Holdings and Executive Summary data.
//
// OneDrive tip: replace a standard share link's trailing query with
// ?download=1 to get the binary instead of the HTML preview page, e.g.
//   https://1drv.ms/x/s!AbCdEf...              ← preview (HTML)
//   https://1drv.ms/x/s!AbCdEf...?download=1   ← raw xlsx
export async function parseXlsxFromUrl(url: string): Promise<Partial<Snapshot> | null> {
  try {
    const attemptUrls = buildCandidateUrls(url);
    let buffer: ArrayBuffer | null = null;
    for (const candidate of attemptUrls) {
      const res = await fetch(candidate, {
        redirect: "follow",
        next: { revalidate: 900 },
      });
      if (!res.ok) continue;
      const contentType = res.headers.get("content-type") ?? "";
      if (contentType.includes("text/html")) continue; // got a preview page, try next
      buffer = await res.arrayBuffer();
      if (buffer.byteLength > 0) break;
    }
    if (!buffer) {
      console.warn("[xlsx] could not obtain binary; all candidate URLs returned HTML");
      return null;
    }

    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(buffer);

    const holdings = extractHoldings(wb);
    const meta = extractMeta(wb);

    return {
      ...meta,
      ...(holdings.length ? { holdings, positions: holdings.length } : {}),
    };
  } catch (err) {
    console.warn("[xlsx] parse failed:", err);
    return null;
  }
}

function buildCandidateUrls(url: string): string[] {
  const withDownload = (u: string) => (u.includes("download=1") ? u : `${u}${u.includes("?") ? "&" : "?"}download=1`);
  const variants = new Set<string>();
  variants.add(url);
  variants.add(withDownload(url));
  return Array.from(variants);
}

function extractHoldings(wb: ExcelJS.Workbook): Holding[] {
  const sheet = findSheet(wb, ["Holdings", "holdings", "Positions"]);
  if (!sheet) return [];

  const headerRow = findHeaderRow(sheet, ["ticker", "symbol"]);
  if (!headerRow) return [];

  const header = rowToStringArray(sheet.getRow(headerRow));
  const col = makeColFinder(header);

  const out: Holding[] = [];
  for (let r = headerRow + 1; r <= sheet.rowCount; r++) {
    const row = sheet.getRow(r);
    const ticker = String(row.getCell(col("ticker", "symbol")).value ?? "").trim();
    if (!ticker || ticker.toUpperCase() === "TOTAL") continue;
    out.push({
      ticker: ticker.toUpperCase(),
      name: stringCell(row, col("name", "security", "company")) || ticker,
      assetClass: (stringCell(row, col("asset class", "assetclass", "asset")) as AssetClass) || "US Equity",
      sector: stringCell(row, col("sector")) || "—",
      weight: numberCell(row, col("weight % (nav)", "weight nav", "weight%", "weight")) || 0,
      pnl: numberCell(row, col("unrealized %", "unrealized", "pnl", "return")) || 0,
      thesis: stringCell(row, col("thesis", "note", "rationale")) || "",
    });
  }
  return out;
}

function extractMeta(wb: ExcelJS.Workbook): Partial<Snapshot> {
  const out: Partial<Snapshot> = {};

  const exec = findSheet(wb, ["Executive Summary", "Summary", "Exec"]);
  if (exec) {
    const map = scrapeLabelValuePairs(exec);
    const pick = (...keys: string[]) => {
      for (const k of keys) {
        const hit = Array.from(map.keys()).find((label) =>
          label.toLowerCase().includes(k.toLowerCase())
        );
        if (hit) return map.get(hit);
      }
      return undefined;
    };
    const n = (v: unknown): number | undefined => {
      if (typeof v === "number") return v;
      if (typeof v === "string") {
        const num = parseFloat(v.replace(/[$,%\s]/g, ""));
        return Number.isFinite(num) ? num : undefined;
      }
      return undefined;
    };
    const nav = n(pick("net asset value", "nav"));
    const since = n(pick("return since inception", "since inception"));
    const annReturn = n(pick("annualized return"));
    const annVol = n(pick("annualized volatility"));
    const mdd = n(pick("max drawdown"));
    const sharpe = n(pick("sharpe"));
    const sortino = n(pick("sortino"));
    const info = n(pick("information ratio"));
    const beta = n(pick("beta"));
    const alpha = n(pick("alpha"));

    if (nav) out.nav = nav;
    if (since !== undefined) out.sinceInception = toPercent(since);
    if (annReturn !== undefined) out.annualizedReturn = toPercent(annReturn);
    if (annVol !== undefined) out.annualizedVol = toPercent(annVol);
    if (mdd !== undefined) out.maxDrawdown = toPercent(mdd);
    if (sharpe !== undefined) out.sharpe = sharpe;
    if (sortino !== undefined) out.sortino = sortino;
    if (info !== undefined) out.informationRatio = info;
    if (beta !== undefined) out.beta = beta;
    if (alpha !== undefined) out.alpha = toPercent(alpha);

    const asOf = pick("as of", "report generated");
    if (asOf) {
      if (asOf instanceof Date) out.asOf = asOf.toISOString().slice(0, 10);
      else if (typeof asOf === "string") out.asOf = asOf;
    }
  }

  return out;
}

function toPercent(v: number): number {
  // Workbook sometimes stores 0.2735 for "27.35%". Detect by magnitude.
  return Math.abs(v) <= 1 ? v * 100 : v;
}

function findSheet(wb: ExcelJS.Workbook, names: string[]) {
  for (const n of names) {
    const s = wb.worksheets.find((ws) => ws.name.toLowerCase() === n.toLowerCase());
    if (s) return s;
  }
  // Partial match
  for (const n of names) {
    const s = wb.worksheets.find((ws) => ws.name.toLowerCase().includes(n.toLowerCase()));
    if (s) return s;
  }
  return null;
}

function findHeaderRow(sheet: ExcelJS.Worksheet, anchors: string[]) {
  const maxScan = Math.min(sheet.rowCount, 40);
  for (let r = 1; r <= maxScan; r++) {
    const arr = rowToStringArray(sheet.getRow(r));
    const lower = arr.map((c) => c.toLowerCase());
    if (anchors.some((a) => lower.includes(a))) return r;
  }
  return null;
}

function rowToStringArray(row: ExcelJS.Row): string[] {
  const out: string[] = [];
  row.eachCell({ includeEmpty: true }, (cell) => {
    out.push(cellText(cell));
  });
  return out;
}

function cellText(cell: ExcelJS.Cell): string {
  const v = cell.value as unknown;
  if (v === null || v === undefined) return "";
  if (typeof v === "string") return v.trim();
  if (typeof v === "number") return String(v);
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v === "object" && v !== null) {
    const rich = v as { richText?: { text: string }[]; text?: string; result?: unknown };
    if (rich.richText) return rich.richText.map((p) => p.text).join("").trim();
    if (rich.text) return String(rich.text).trim();
    if (rich.result !== undefined) return String(rich.result);
  }
  return String(v);
}

function makeColFinder(header: string[]) {
  const normalized = header.map((h) => h.toLowerCase().replace(/[\s_%()-]/g, ""));
  return (...candidates: string[]) => {
    for (const cand of candidates) {
      const target = cand.toLowerCase().replace(/[\s_%()-]/g, "");
      const idx = normalized.findIndex((h) => h === target || h.startsWith(target));
      if (idx >= 0) return idx + 1;
    }
    return 0;
  };
}

function stringCell(row: ExcelJS.Row, col: number): string {
  if (!col) return "";
  return cellText(row.getCell(col));
}

function numberCell(row: ExcelJS.Row, col: number): number | undefined {
  if (!col) return undefined;
  const v = row.getCell(col).value as unknown;
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = parseFloat(v.replace(/[$,%\s]/g, ""));
    return Number.isFinite(n) ? n : undefined;
  }
  if (v && typeof v === "object" && "result" in v) {
    const r = (v as { result: unknown }).result;
    if (typeof r === "number") return r;
  }
  return undefined;
}

function scrapeLabelValuePairs(sheet: ExcelJS.Worksheet): Map<string, unknown> {
  // Walks the sheet and captures cell pairs where a text label is followed by a value
  // either in the same row (next column) or the cell immediately below.
  const map = new Map<string, unknown>();
  const max = Math.min(sheet.rowCount, 200);
  for (let r = 1; r <= max; r++) {
    const row = sheet.getRow(r);
    row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
      const label = cellText(cell);
      if (!label || typeof cell.value !== "string") return;
      const rightVal = row.getCell(colNumber + 1).value;
      if (rightVal !== null && rightVal !== undefined && rightVal !== "") {
        map.set(label, rightVal);
        return;
      }
      const belowVal = sheet.getRow(r + 1).getCell(colNumber).value;
      if (belowVal !== null && belowVal !== undefined && belowVal !== "") {
        map.set(label, belowVal);
      }
    });
  }
  return map;
}
