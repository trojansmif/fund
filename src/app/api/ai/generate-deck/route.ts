import { NextRequest, NextResponse } from "next/server";
import PptxGenJS from "pptxgenjs";
import { callLlmForJson, type Provider } from "@/lib/ai/llm";

// POST /api/ai/generate-deck
// Body: { provider: "anthropic"|"openai", apiKey: string, ticker: string, brief?: string, model?: string }
// Returns: application/vnd.openxmlformats-officedocument.presentationml.presentation
//
// Asks the user's chosen LLM to draft a Trojan SMIF pitch deck as structured
// JSON, then assembles a PPTX. The API key is forwarded once and never stored.

export const runtime = "nodejs";
export const maxDuration = 300;

type Slide = {
  title: string;
  bullets?: string[];
  paragraph?: string;
  notes?: string;
};

type DeckPayload = {
  ticker: string;
  company: string;
  recommendation: "BUY" | "HOLD" | "SELL";
  thesis: string;
  slides: Slide[];
};

const SYSTEM = `You are an equity research analyst for the Trojan SMIF, a student-run investment fund at USC Marshall. You draft concise, evidence-driven pitch decks. Always respond with a single JSON object and nothing else — no prose, no markdown fences.`;

function userPrompt(ticker: string, brief: string): string {
  return `Draft a pitch deck for ticker ${ticker}.${brief ? `\n\nAnalyst brief: ${brief}` : ""}

Return JSON matching this TypeScript type:

type DeckPayload = {
  ticker: string;
  company: string;
  recommendation: "BUY" | "HOLD" | "SELL";
  thesis: string;
  slides: Array<{
    title: string;
    bullets?: string[];
    paragraph?: string;
    notes?: string;
  }>;
};

Required slides in order:
  1. Title slide (paragraph: one-sentence thesis)
  2. Company snapshot (bullets: business, end markets, market cap, key metrics)
  3. Investment thesis (3-4 bullets)
  4. Catalysts (3-4 bullets, near-term and 12-month)
  5. Valuation (bullets: target price method, key DCF/multiples assumptions)
  6. Risks (3-4 bullets)
  7. Recommendation (paragraph: rec, target price, expected return, sizing)

Keep every bullet under 18 words.`;
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

  let payload: DeckPayload;
  try {
    payload = await callLlmForJson<DeckPayload>({
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

  if (!payload || !Array.isArray(payload.slides)) {
    return NextResponse.json({ error: "LLM returned malformed deck JSON" }, { status: 502 });
  }

  const buffer = await buildPptx(payload);
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "content-type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "content-disposition": `attachment; filename="${ticker}_pitch_deck.pptx"`,
    },
  });
}

const CARDINAL = "990000";
const INK = "111827";
const MUTED = "6B7280";
const PAPER = "FFFFFF";
const BONE = "F5F2EC";

async function buildPptx(d: DeckPayload): Promise<Buffer> {
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  pptx.title = `${d.ticker} — ${d.company}`;
  pptx.company = "Trojan SMIF";

  const cover = pptx.addSlide();
  cover.background = { color: PAPER };
  cover.addShape("rect", { x: 0.5, y: 1.0, w: 0.04, h: 5.5, fill: { color: CARDINAL } });
  cover.addText("TROJAN SMIF · EQUITY RESEARCH", {
    x: 0.8, y: 1.0, w: 11, h: 0.4,
    fontFace: "Calibri", fontSize: 12, color: MUTED, bold: true, charSpacing: 3,
  });
  cover.addText(`${d.ticker} — ${d.company}`, {
    x: 0.8, y: 1.6, w: 11, h: 1.2,
    fontFace: "Calibri", fontSize: 40, color: INK, bold: true,
  });
  cover.addText(d.thesis, {
    x: 0.8, y: 3.0, w: 11, h: 1.6,
    fontFace: "Calibri", fontSize: 22, color: INK, italic: true,
  });
  cover.addText(`Recommendation: ${d.recommendation}`, {
    x: 0.8, y: 5.5, w: 11, h: 0.4,
    fontFace: "Calibri", fontSize: 14, color: CARDINAL, bold: true,
  });

  for (const s of d.slides) {
    const slide = pptx.addSlide();
    slide.background = { color: PAPER };
    slide.addShape("rect", { x: 0, y: 0, w: 13.33, h: 0.5, fill: { color: BONE } });
    slide.addText(d.ticker, {
      x: 0.5, y: 0.05, w: 5, h: 0.4,
      fontFace: "Calibri", fontSize: 10, color: MUTED, bold: true, charSpacing: 2,
    });
    slide.addText("TROJAN SMIF", {
      x: 7.83, y: 0.05, w: 5, h: 0.4, align: "right",
      fontFace: "Calibri", fontSize: 10, color: CARDINAL, bold: true, charSpacing: 2,
    });
    slide.addText(s.title, {
      x: 0.5, y: 0.8, w: 12.33, h: 0.8,
      fontFace: "Calibri", fontSize: 28, color: INK, bold: true,
    });
    slide.addShape("rect", { x: 0.5, y: 1.55, w: 1.2, h: 0.04, fill: { color: CARDINAL } });

    if (s.paragraph) {
      slide.addText(s.paragraph, {
        x: 0.5, y: 2.0, w: 12.33, h: 4.5,
        fontFace: "Calibri", fontSize: 18, color: INK, valign: "top",
      });
    } else if (s.bullets && s.bullets.length) {
      slide.addText(
        s.bullets.map((b) => ({ text: b, options: { bullet: { code: "25A0" } } })),
        {
          x: 0.5, y: 2.0, w: 12.33, h: 4.5,
          fontFace: "Calibri", fontSize: 18, color: INK, valign: "top", paraSpaceAfter: 12,
        }
      );
    }

    if (s.notes) slide.addNotes(s.notes);
  }

  const out = await pptx.write({ outputType: "nodebuffer" });
  return Buffer.isBuffer(out) ? out : Buffer.from(out as ArrayBuffer);
}
