// Provider-agnostic JSON-mode call. Each member supplies their own API key,
// and we forward it to Anthropic or OpenAI from the server route. The key is
// only ever in transit on the same request — we never store it.

export type Provider = "anthropic" | "openai";

export type LlmCallOpts = {
  provider: Provider;
  apiKey: string;
  model?: string;
  system: string;
  user: string;
};

const DEFAULT_MODELS: Record<Provider, string> = {
  anthropic: "claude-sonnet-4-6",
  openai: "gpt-4o-mini",
};

export async function callLlmForJson<T>(opts: LlmCallOpts): Promise<T> {
  const model = opts.model || DEFAULT_MODELS[opts.provider];
  const raw = opts.provider === "anthropic"
    ? await callAnthropic({ ...opts, model })
    : await callOpenAI({ ...opts, model });

  return parseJson<T>(raw);
}

async function callAnthropic(opts: Required<Pick<LlmCallOpts, "model">> & LlmCallOpts): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": opts.apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: opts.model,
      max_tokens: 4096,
      system: opts.system,
      messages: [{ role: "user", content: opts.user }],
    }),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Anthropic ${res.status}: ${detail.slice(0, 400)}`);
  }
  const json = await res.json();
  const text = (json.content || []).find((c: { type: string }) => c.type === "text");
  if (!text?.text) throw new Error("Anthropic returned no text content");
  return text.text;
}

async function callOpenAI(opts: Required<Pick<LlmCallOpts, "model">> & LlmCallOpts): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${opts.apiKey}`,
    },
    body: JSON.stringify({
      model: opts.model,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: opts.system },
        { role: "user", content: opts.user },
      ],
    }),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`OpenAI ${res.status}: ${detail.slice(0, 400)}`);
  }
  const json = await res.json();
  const text = json.choices?.[0]?.message?.content;
  if (!text) throw new Error("OpenAI returned no message content");
  return text;
}

function parseJson<T>(raw: string): T {
  // Strip markdown fences and find the first {...} block, since not every
  // model honors "respond with JSON only".
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : raw;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("LLM response had no JSON object");
  return JSON.parse(candidate.slice(start, end + 1)) as T;
}
