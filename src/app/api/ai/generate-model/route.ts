import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { callLlmForJson, type Provider } from "@/lib/ai/llm";

// POST /api/ai/generate-model
// Body: { provider, apiKey, ticker, brief?, model? }
// Returns: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
//
// Asks the LLM for a structured DCF + comps workbook payload, then assembles
// an .xlsx with three sheets: Assumptions, DCF, Comps.

export const runtime = "nodejs";
export const maxDuration = 300;

type Workbook = {
  ticker: string;
  company: string;
  assumptions: Array<{ label: string; value: number | string; note?: string }>;
  dcf: {
    years: number[];
    revenue: number[];
    ebitMargin: number[];
    taxRate: number;
    capexPctRev: number[];
    daPctRev: number[];
    nwcPctRev: number[];
    wacc: number;
    terminalGrowth: number;
    sharesOut: number;
    netDebt: number;
  };
  comps: Array<{
    ticker: string;
    company: string;
    evEbitda: number;
    pe: number;
    evSales: number;
  }>;
};

const SYSTEM = `You are a sell-side equity analyst. Build a clean DCF + comps payload for the requested ticker. Use plausible, internally consistent estimates anchored to the most recent fiscal year you know about. Always respond with a single JSON object, no prose, no markdown.`;

function userPrompt(ticker: string, brief: string): string {
  return `Build a 5-year DCF + comps workbook payload for ${ticker}.${brief ? `\n\nAnalyst brief: ${brief}` : ""}

Return JSON matching:

{
  "ticker": string,
  "company": string,
  "assumptions": [{ "label": string, "value": number|string, "note"?: string }],
  "dcf": {
    "years": number[],            // exactly 5 forward years
    "revenue": number[],          // $M, length 5
    "ebitMargin": number[],       // decimals 0-1, length 5
    "taxRate": number,            // decimal 0-1
    "capexPctRev": number[],      // decimals, length 5
    "daPctRev": number[],         // decimals, length 5
    "nwcPctRev": number[],        // decimals (change in NWC), length 5
    "wacc": number,               // decimal 0-1
    "terminalGrowth": number,     // decimal 0-1
    "sharesOut": number,          // millions of shares
    "netDebt": number             // $M (negative = net cash)
  },
  "comps": [{ "ticker": string, "company": string, "evEbitda": number, "pe": number, "evSales": number }]
}

Use realistic numbers. All percentages as decimals (0.18 not 18).`;
}

export async function POST(req: NextRequest) {
  let body: { provider?: Provider; apiKey?: string; ticker?: string; brief?: string; model?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const provider = body.provider;
  const apiKey = (body.apiKey || "").trim();
  const ticker = (body.ticker || "").trim().toUpperCase();
  const brief = (body.brief || "").trim();

  if (provider !== "anthropic" && provider !== "openai") {
    return NextResponse.json({ error: "provider must be 'anthropic' or 'openai'" }, { status: 400 });
  }
  if (!apiKey) return NextResponse.json({ error: "Missing apiKey" }, { status: 400 });
  if (!/^[A-Z.\-]{1,8}$/.test(ticker)) {
    return NextResponse.json({ error: "ticker must be 1-8 letters" }, { status: 400 });
  }

  let payload: Workbook;
  try {
    payload = await callLlmForJson<Workbook>({
      provider,
      apiKey,
      model: body.model,
      system: SYSTEM,
      user: userPrompt(ticker, brief),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "LLM call failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  const buffer = await buildXlsx(payload);
  return new NextResponse(buffer as unknown as BodyInit, {
    status: 200,
    headers: {
      "content-type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "content-disposition": `attachment; filename="${ticker}_valuation.xlsx"`,
    },
  });
}

async function buildXlsx(d: Workbook): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Trojan SMIF";
  wb.created = new Date();

  const cardinal = { argb: "FF990000" };
  const ink = { argb: "FF111827" };
  const bone = { argb: "FFF5F2EC" };

  const titleStyle = (cell: ExcelJS.Cell) => {
    cell.font = { name: "Calibri", size: 14, bold: true, color: ink };
  };
  const headerStyle = (cell: ExcelJS.Cell) => {
    cell.font = { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: cardinal };
    cell.alignment = { horizontal: "center" };
    cell.border = { bottom: { style: "thin", color: cardinal } };
  };
  const labelCell = (cell: ExcelJS.Cell) => {
    cell.font = { name: "Calibri", size: 11, color: ink };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: bone };
  };
  const numFmt = "#,##0.00";
  const pctFmt = "0.0%";

  const a = wb.addWorksheet("Assumptions", { properties: { tabColor: { argb: "FF990000" } } });
  a.columns = [{ width: 36 }, { width: 18 }, { width: 60 }];
  a.getCell("A1").value = `${d.ticker} — ${d.company}`;
  titleStyle(a.getCell("A1"));
  a.getCell("A2").value = "Key assumptions";
  a.getCell("A2").font = { name: "Calibri", size: 10, italic: true, color: { argb: "FF6B7280" } };

  ["Driver", "Value", "Note"].forEach((h, i) => {
    const cell = a.getCell(4, i + 1);
    cell.value = h;
    headerStyle(cell);
  });
  d.assumptions.forEach((row, i) => {
    const r = 5 + i;
    a.getCell(r, 1).value = row.label;
    labelCell(a.getCell(r, 1));
    a.getCell(r, 2).value = row.value;
    a.getCell(r, 3).value = row.note ?? "";
  });

  const s = wb.addWorksheet("DCF", { properties: { tabColor: { argb: "FF111827" } } });
  s.columns = [{ width: 32 }, ...d.dcf.years.map(() => ({ width: 14 })), { width: 16 }];
  s.getCell("A1").value = `${d.ticker} — DCF (USD millions)`;
  titleStyle(s.getCell("A1"));

  const header = ["Driver", ...d.dcf.years.map((y) => String(y)), "Terminal"];
  header.forEach((h, i) => {
    const cell = s.getCell(3, i + 1);
    cell.value = h;
    headerStyle(cell);
  });

  const writeRow = (rowIdx: number, label: string, values: (number | { f: string })[], format?: string) => {
    const lc = s.getCell(rowIdx, 1);
    lc.value = label;
    labelCell(lc);
    values.forEach((v, i) => {
      const c = s.getCell(rowIdx, i + 2);
      if (typeof v === "object" && "f" in v) c.value = { formula: v.f } as ExcelJS.CellValue;
      else c.value = v;
      if (format) c.numFmt = format;
    });
  };

  writeRow(4, "Revenue", d.dcf.revenue, numFmt);
  writeRow(5, "EBIT margin", d.dcf.ebitMargin, pctFmt);
  const ebitFormulas = d.dcf.years.map((_, i) => {
    const col = colLetter(i + 2);
    return { f: `${col}4*${col}5` };
  });
  writeRow(6, "EBIT", ebitFormulas, numFmt);
  writeRow(7, "Tax rate", d.dcf.years.map(() => d.dcf.taxRate), pctFmt);
  writeRow(8, "NOPAT", d.dcf.years.map((_, i) => {
    const col = colLetter(i + 2);
    return { f: `${col}6*(1-${col}7)` };
  }), numFmt);
  writeRow(9, "D&A %", d.dcf.daPctRev, pctFmt);
  writeRow(10, "D&A ($)", d.dcf.years.map((_, i) => {
    const col = colLetter(i + 2);
    return { f: `${col}4*${col}9` };
  }), numFmt);
  writeRow(11, "Capex %", d.dcf.capexPctRev, pctFmt);
  writeRow(12, "Capex ($)", d.dcf.years.map((_, i) => {
    const col = colLetter(i + 2);
    return { f: `${col}4*${col}11` };
  }), numFmt);
  writeRow(13, "Δ NWC %", d.dcf.nwcPctRev, pctFmt);
  writeRow(14, "Δ NWC ($)", d.dcf.years.map((_, i) => {
    const col = colLetter(i + 2);
    return { f: `${col}4*${col}13` };
  }), numFmt);
  writeRow(15, "FCF", d.dcf.years.map((_, i) => {
    const col = colLetter(i + 2);
    return { f: `${col}8+${col}10-${col}12-${col}14` };
  }), numFmt);

  s.getCell("A17").value = "WACC";
  labelCell(s.getCell("A17"));
  s.getCell("B17").value = d.dcf.wacc;
  s.getCell("B17").numFmt = pctFmt;
  s.getCell("A18").value = "Terminal growth";
  labelCell(s.getCell("A18"));
  s.getCell("B18").value = d.dcf.terminalGrowth;
  s.getCell("B18").numFmt = pctFmt;

  const dfFormulas = d.dcf.years.map((_, i) => ({ f: `1/(1+$B$17)^${i + 1}` }));
  writeRow(16, "Discount factor", dfFormulas, "0.0000");
  const lastYearCol = colLetter(d.dcf.years.length + 1);
  const tvCol = colLetter(d.dcf.years.length + 2);
  s.getCell(`${tvCol}15`).value = { formula: `${lastYearCol}15*(1+$B$18)/($B$17-$B$18)` } as ExcelJS.CellValue;
  s.getCell(`${tvCol}15`).numFmt = numFmt;
  s.getCell("A19").value = "PV of FCF";
  labelCell(s.getCell("A19"));
  d.dcf.years.forEach((_, i) => {
    const col = colLetter(i + 2);
    s.getCell(`${col}19`).value = { formula: `${col}15*${col}16` } as ExcelJS.CellValue;
    s.getCell(`${col}19`).numFmt = numFmt;
  });
  s.getCell(`${tvCol}19`).value = { formula: `${tvCol}15*${lastYearCol}16` } as ExcelJS.CellValue;
  s.getCell(`${tvCol}19`).numFmt = numFmt;

  s.getCell("A21").value = "Enterprise value";
  labelCell(s.getCell("A21"));
  s.getCell("B21").value = { formula: `SUM(B19:${tvCol}19)` } as ExcelJS.CellValue;
  s.getCell("B21").numFmt = numFmt;

  s.getCell("A22").value = "Net debt";
  labelCell(s.getCell("A22"));
  s.getCell("B22").value = d.dcf.netDebt;
  s.getCell("B22").numFmt = numFmt;

  s.getCell("A23").value = "Equity value";
  labelCell(s.getCell("A23"));
  s.getCell("B23").value = { formula: `B21-B22` } as ExcelJS.CellValue;
  s.getCell("B23").numFmt = numFmt;

  s.getCell("A24").value = "Shares out (M)";
  labelCell(s.getCell("A24"));
  s.getCell("B24").value = d.dcf.sharesOut;
  s.getCell("B24").numFmt = numFmt;

  s.getCell("A25").value = "Target price";
  s.getCell("A25").font = { name: "Calibri", size: 11, bold: true, color: ink };
  s.getCell("A25").fill = { type: "pattern", pattern: "solid", fgColor: bone };
  s.getCell("B25").value = { formula: `B23/B24` } as ExcelJS.CellValue;
  s.getCell("B25").font = { name: "Calibri", size: 12, bold: true, color: cardinal };
  s.getCell("B25").numFmt = "$#,##0.00";

  const c = wb.addWorksheet("Comps", { properties: { tabColor: { argb: "FFF5F2EC" } } });
  c.columns = [{ width: 12 }, { width: 32 }, { width: 14 }, { width: 14 }, { width: 14 }];
  c.getCell("A1").value = `${d.ticker} — Comparable companies`;
  titleStyle(c.getCell("A1"));
  ["Ticker", "Company", "EV/EBITDA", "P/E", "EV/Sales"].forEach((h, i) => {
    const cell = c.getCell(3, i + 1);
    cell.value = h;
    headerStyle(cell);
  });
  d.comps.forEach((p, i) => {
    const r = 4 + i;
    c.getCell(r, 1).value = p.ticker;
    c.getCell(r, 2).value = p.company;
    c.getCell(r, 3).value = p.evEbitda;
    c.getCell(r, 4).value = p.pe;
    c.getCell(r, 5).value = p.evSales;
    [3, 4, 5].forEach((col) => (c.getCell(r, col).numFmt = "0.00"));
  });
  const last = 4 + d.comps.length - 1;
  const medRow = last + 2;
  c.getCell(medRow, 2).value = "Median";
  c.getCell(medRow, 2).font = { bold: true };
  [3, 4, 5].forEach((col) => {
    const cl = colLetter(col);
    c.getCell(medRow, col).value = { formula: `MEDIAN(${cl}4:${cl}${last})` } as ExcelJS.CellValue;
    c.getCell(medRow, col).numFmt = "0.00";
    c.getCell(medRow, col).font = { bold: true };
  });

  const arr = await wb.xlsx.writeBuffer();
  return Buffer.from(arr as ArrayBuffer);
}

function colLetter(n: number): string {
  let s = "";
  while (n > 0) {
    const rem = (n - 1) % 26;
    s = String.fromCharCode(65 + rem) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}
