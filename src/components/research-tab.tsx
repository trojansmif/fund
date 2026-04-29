"use client";

import { useEffect, useState } from "react";

type Provider = "anthropic" | "openai";

const KEY_STORAGE = "smif.ai.key";
const PROVIDER_STORAGE = "smif.ai.provider";
const MODEL_STORAGE = "smif.ai.model";

// Two AI generators that use the member's own API key. The key is read from
// localStorage, sent once per request to our server route, and never stored
// server-side. PPTX is built with pptxgenjs, XLSX with exceljs.
export function ResearchTab() {
  const [provider, setProvider] = useState<Provider>("anthropic");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("");
  const [keySaved, setKeySaved] = useState(false);

  useEffect(() => {
    const p = (localStorage.getItem(PROVIDER_STORAGE) as Provider | null) || "anthropic";
    const k = localStorage.getItem(KEY_STORAGE) || "";
    const m = localStorage.getItem(MODEL_STORAGE) || "";
    setProvider(p);
    setApiKey(k);
    setModel(m);
    setKeySaved(!!k);
  }, []);

  function saveKey() {
    localStorage.setItem(PROVIDER_STORAGE, provider);
    localStorage.setItem(KEY_STORAGE, apiKey.trim());
    if (model.trim()) localStorage.setItem(MODEL_STORAGE, model.trim());
    else localStorage.removeItem(MODEL_STORAGE);
    setKeySaved(!!apiKey.trim());
  }

  function clearKey() {
    localStorage.removeItem(KEY_STORAGE);
    localStorage.removeItem(MODEL_STORAGE);
    setApiKey("");
    setModel("");
    setKeySaved(false);
  }

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <Card title="AI connection" span="md:col-span-12">
        <p className="text-sm text-[var(--color-muted)] leading-relaxed">
          Bring your own Anthropic or OpenAI API key. Keys live in this browser
          only — they're sent with each request to generate a deck or
          spreadsheet, but never stored on the Fund's server.
        </p>
        <div className="mt-5 grid grid-cols-12 gap-3">
          <label className="col-span-12 sm:col-span-3">
            <span className="rule-label mb-1.5 inline-block">Provider</span>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as Provider)}
              className="w-full border hairline bg-[var(--color-paper)] px-3 py-2 font-mono text-sm outline-none focus:border-[var(--color-cardinal)]"
            >
              <option value="anthropic">Anthropic (Claude)</option>
              <option value="openai">OpenAI (GPT)</option>
            </select>
          </label>
          <label className="col-span-12 sm:col-span-6">
            <span className="rule-label mb-1.5 inline-block">API key</span>
            <input
              type="password"
              autoComplete="off"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={provider === "anthropic" ? "sk-ant-..." : "sk-..."}
              className="w-full border hairline bg-[var(--color-paper)] px-3 py-2 font-mono text-sm outline-none focus:border-[var(--color-cardinal)]"
            />
          </label>
          <label className="col-span-12 sm:col-span-3">
            <span className="rule-label mb-1.5 inline-block">Model (optional)</span>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder={provider === "anthropic" ? "claude-sonnet-4-6" : "gpt-4o-mini"}
              className="w-full border hairline bg-[var(--color-paper)] px-3 py-2 font-mono text-sm outline-none focus:border-[var(--color-cardinal)]"
            />
          </label>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={saveKey}
            disabled={!apiKey.trim()}
            className="bg-[var(--color-cardinal)] text-[var(--color-paper)] px-4 py-2 text-xs uppercase font-mono hover:bg-[var(--color-cardinal-deep)] disabled:opacity-40"
          >
            Save key
          </button>
          {keySaved && (
            <button
              onClick={clearKey}
              className="text-xs font-mono uppercase text-[var(--color-muted)] border-b hairline pb-0.5 hover:text-[var(--color-cardinal)]"
            >
              Forget key
            </button>
          )}
          {keySaved && (
            <span className="text-[10px] font-mono uppercase text-[var(--color-positive)]">
              ● Connected
            </span>
          )}
        </div>
      </Card>

      <Generator
        kind="deck"
        title="Generate pitch deck"
        subtitle="LLM drafts a Trojan SMIF–styled .pptx pitch from a ticker + brief."
        ctaLabel="Generate deck"
        endpoint="/api/ai/generate-deck"
        downloadSuffix="_pitch_deck.pptx"
        provider={provider}
        apiKey={apiKey}
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
        apiKey={apiKey}
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
  apiKey,
  model,
  keySaved,
}: {
  kind: "deck" | "model";
  title: string;
  subtitle: string;
  ctaLabel: string;
  endpoint: string;
  downloadSuffix: string;
  provider: Provider;
  apiKey: string;
  model: string;
  keySaved: boolean;
}) {
  const [ticker, setTicker] = useState("");
  const [brief, setBrief] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function generate() {
    setErr(null);
    if (!keySaved) {
      setErr("Save an API key in the AI connection card first.");
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
            className="w-full border hairline bg-[var(--color-paper)] px-3 py-2 font-mono text-sm outline-none focus:border-[var(--color-cardinal)]"
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
            placeholder={
              kind === "deck"
                ? "e.g. Long-cycle infrastructure spend + dealer inventory normalization; rerate as backlog converts."
                : "e.g. Mid-cycle assumptions, mid-teens EBIT margin, 9% WACC, 2.5% terminal."
            }
            className="w-full border hairline bg-[var(--color-paper)] px-3 py-2 font-mono text-sm outline-none focus:border-[var(--color-cardinal)] resize-y"
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
          <span className="text-[10px] font-mono uppercase text-[var(--color-muted)]">
            Connect AI key first
          </span>
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
