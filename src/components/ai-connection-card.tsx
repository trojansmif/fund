"use client";

import { useEffect, useState } from "react";

export type AIProvider = "anthropic" | "openai";

export const AI_KEY_STORAGE = "smif.ai.key";
export const AI_PROVIDER_STORAGE = "smif.ai.provider";
export const AI_MODEL_STORAGE = "smif.ai.model";

// Custom event so other tabs in the dashboard (e.g. Research) update
// immediately when the user saves or forgets a key, without waiting for the
// browser's native 'storage' event (which only fires across tabs).
export const AI_CONNECTION_EVENT = "smif:ai-connection-changed";

export function emitAIConnectionChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AI_CONNECTION_EVENT));
  }
}

export function useAIConnectionState() {
  const [provider, setProvider] = useState<AIProvider>("anthropic");
  const [keySaved, setKeySaved] = useState(false);
  const [model, setModel] = useState("");

  useEffect(() => {
    function read() {
      const p = (localStorage.getItem(AI_PROVIDER_STORAGE) as AIProvider | null) || "anthropic";
      const k = localStorage.getItem(AI_KEY_STORAGE) || "";
      const m = localStorage.getItem(AI_MODEL_STORAGE) || "";
      setProvider(p);
      setKeySaved(!!k);
      setModel(m);
    }
    read();
    const onChange = () => read();
    window.addEventListener(AI_CONNECTION_EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(AI_CONNECTION_EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  return { provider, keySaved, model };
}

/** Reads the live API key directly from localStorage on demand. */
export function readAIKey(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(AI_KEY_STORAGE) || "";
}

export function AIConnectionCard() {
  const [provider, setProvider] = useState<AIProvider>("anthropic");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("");
  const [keySaved, setKeySaved] = useState(false);

  useEffect(() => {
    const p = (localStorage.getItem(AI_PROVIDER_STORAGE) as AIProvider | null) || "anthropic";
    const k = localStorage.getItem(AI_KEY_STORAGE) || "";
    const m = localStorage.getItem(AI_MODEL_STORAGE) || "";
    setProvider(p);
    setApiKey(k);
    setModel(m);
    setKeySaved(!!k);
  }, []);

  function saveKey() {
    localStorage.setItem(AI_PROVIDER_STORAGE, provider);
    localStorage.setItem(AI_KEY_STORAGE, apiKey.trim());
    if (model.trim()) localStorage.setItem(AI_MODEL_STORAGE, model.trim());
    else localStorage.removeItem(AI_MODEL_STORAGE);
    setKeySaved(!!apiKey.trim());
    emitAIConnectionChange();
  }

  function clearKey() {
    localStorage.removeItem(AI_KEY_STORAGE);
    localStorage.removeItem(AI_MODEL_STORAGE);
    setApiKey("");
    setModel("");
    setKeySaved(false);
    emitAIConnectionChange();
  }

  return (
    <div className="col-span-12 border hairline bg-[var(--color-paper)]">
      <div className="px-4 md:px-5 py-3 border-b hairline bg-[var(--color-bone)]">
        <div className="rule-label">AI connection</div>
      </div>
      <div className="px-4 md:px-5 py-4 md:py-5">
        <p className="text-sm text-[var(--color-muted)] leading-relaxed">
          Bring your own Anthropic or OpenAI API key to unlock the deck and
          workbook generators on the Research tab. Keys live in this browser
          only — they&apos;re sent with each request, never stored on the
          Fund&apos;s server.
        </p>
        <div className="mt-5 grid grid-cols-12 gap-3">
          <label className="col-span-12 sm:col-span-3">
            <span className="rule-label mb-1.5 inline-block">Provider</span>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as AIProvider)}
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
      </div>
    </div>
  );
}
