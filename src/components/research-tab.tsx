"use client";

import { useState } from "react";
import {
  readAIKey,
  useAIConnectionState,
  type AIProvider,
} from "@/components/ai-connection-card";

// Two AI generators that use the member's own API key. Provider/model are
// configured under Profile → AI connection. The key is read from
// localStorage at request time, sent once per request to our server route,
// and never stored server-side. PPTX is built with pptxgenjs, XLSX with
// exceljs.
export function ResearchTab() {
  const { provider, model, keySaved } = useAIConnectionState();

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      {!keySaved && (
        <Card title="Research generators" span="md:col-span-12">
          <p className="text-sm text-[var(--color-muted)] leading-relaxed">
            Generate AI-drafted pitch decks and valuation workbooks straight
            from a ticker and a short brief. To use them, connect your
            Anthropic or OpenAI API key under{" "}
            <a
              href="/dashboard?tab=profile"
              className="text-[var(--color-cardinal)] border-b border-[var(--color-cardinal)] pb-0.5 font-mono uppercase text-[12px]"
            >
              Profile → AI connection
            </a>
            . Keys stay in your browser only.
          </p>
        </Card>
      )}

      <Generator
        kind="deck"
        title="Generate pitch deck"
        subtitle="LLM drafts a Trojan SMIF–styled .pptx pitch from a ticker + brief."
        ctaLabel="Generate deck"
        endpoint="/api/ai/generate-deck"
        downloadSuffix="_pitch_deck.pptx"
        provider={provider}
        model={model}
        keySaved={keySaved}
      />

      <Generator
        kind="model"
        title="Generate valuation workbook"
        subtitle="LLM fills a 5-year DCF + comps payload, then assembles a formula-driven .xlsx."
        ctaLabel="Generate workbook"
        endpoint="/api/ai/generate-model"
        downloadSuffix="_valuation.xlsx"
        provider={provider}
        model={model}
        keySaved={keySaved}
      />
    </div>
  );
}

function Generator({
  kind,
  title,
  subtitle,
  ctaLabel,
  endpoint,
  downloadSuffix,
  provider,
  model,
  keySaved,
}: {
  kind: "deck" | "model";
  title: string;
  subtitle: string;
  ctaLabel: string;
  endpoint: string;
  downloadSuffix: string;
  provider: AIProvider;
  model: string;
  keySaved: boolean;
}) {
  const [ticker, setTicker] = useState("");
  const [brief, setBrief] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function generate() {
    setErr(null);
    const apiKey = readAIKey();
    if (!apiKey) {
      setErr("Connect your AI API key under Profile → AI connection first.");
      return;
    }
    const t = ticker.trim().toUpperCase();
    if (!/^[A-Z.\-]{1,8}$/.test(t)) {
      setErr("Enter a valid ticker (1-8 letters).");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          provider,
          apiKey,
          model: model || undefined,
          ticker: t,
          brief: brief.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const detail = await res.json().catch(() => ({}));
        throw new Error(detail.error || `Request failed (${res.status})`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${t}${downloadSuffix}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card title={title} span="md:col-span-6">
      <p className="text-sm text-[var(--color-muted)] leading-relaxed">{subtitle}</p>
      <div className="mt-5 space-y-3">
        <label className="block">
          <span className="rule-label mb-1.5 inline-block">Ticker</span>
          <input
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            placeholder="AAPL"
            disabled={!keySaved}
            className="w-full border hairline bg-[var(--color-paper)] px-3 py-2 font-mono text-sm outline-none focus:border-[var(--color-cardinal)] disabled:opacity-50"
          />
        </label>
        <label className="block">
          <span className="rule-label mb-1.5 inline-block">
            Analyst brief {kind === "deck" ? "(thesis, catalysts, angle)" : "(view, drivers, target)"}
          </span>
          <textarea
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            rows={4}
            disabled={!keySaved}
            placeholder={
              kind === "deck"
                ? "e.g. Long-cycle infrastructure spend + dealer inventory normalization; rerate as backlog converts."
                : "e.g. Mid-cycle assumptions, mid-teens EBIT margin, 9% WACC, 2.5% terminal."
            }
            className="w-full border hairline bg-[var(--color-paper)] px-3 py-2 font-mono text-sm outline-none focus:border-[var(--color-cardinal)] resize-y disabled:opacity-50"
          />
        </label>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={generate}
          disabled={busy || !keySaved}
          className="bg-[var(--color-cardinal)] text-[var(--color-paper)] px-4 py-2 text-xs uppercase font-mono hover:bg-[var(--color-cardinal-deep)] disabled:opacity-40"
        >
          {busy ? "Generating…" : ctaLabel}
        </button>
        {!keySaved && (
          <a
            href="/dashboard?tab=profile"
            className="text-[10px] font-mono uppercase text-[var(--color-cardinal)] border-b border-[var(--color-cardinal)] pb-0.5"
          >
            Connect AI key →
          </a>
        )}
      </div>
      {err && (
        <div className="mt-3 text-[11px] font-mono uppercase border border-[var(--color-negative)] text-[var(--color-negative)] px-3 py-2">
          {err}
        </div>
      )}
    </Card>
  );
}

function Card({
  title,
  children,
  span = "md:col-span-12",
}: {
  title: string;
  children: React.ReactNode;
  span?: string;
}) {
  return (
    <div className={`col-span-12 ${span} border hairline bg-[var(--color-paper)]`}>
      <div className="flex items-center justify-between px-4 md:px-5 py-3 border-b hairline bg-[var(--color-bone)]">
        <div className="rule-label">{title}</div>
      </div>
      <div className="px-4 md:px-5 py-4 md:py-5">{children}</div>
    </div>
  );
}
