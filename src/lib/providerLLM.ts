export interface SimpleMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface CallOptions {
  apiKey: string;
  messages: SimpleMessage[];
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export async function callOpenAI(options: CallOptions): Promise<string> {
  const { apiKey, messages, model = "gpt-4o-mini", maxTokens = 1024, temperature = 0.2 } = options;
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, messages, max_tokens: maxTokens, temperature }),
  });
  if (!res.ok) {
    const error = await res.text().catch(() => "Unknown OpenAI error");
    throw new Error(`OpenAI error ${res.status}: ${error}`);
  }
  const json = (await res.json()) as { choices?: [{ message?: { content?: string } }] };
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenAI returned empty content");
  return content;
}

export async function callAnthropic(options: CallOptions): Promise<string> {
  const { apiKey, messages, model = "claude-3-5-sonnet-20241022", maxTokens = 1024, temperature = 0.2 } = options;
  const systemMsg = messages.find((m) => m.role === "system");
  const other = messages.filter((m) => m.role !== "system");
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model, max_tokens: maxTokens, temperature,
      system: systemMsg?.content,
      messages: other.map((m) => ({ role: m.role, content: m.content })),
    }),
  });
  if (!res.ok) {
    const error = await res.text().catch(() => "Unknown Anthropic error");
    throw new Error(`Anthropic error ${res.status}: ${error}`);
  }
  const json = (await res.json()) as { content?: [{ text?: string }] };
  const text = json.content?.[0]?.text;
  if (!text) throw new Error("Anthropic returned empty content");
  return text;
}
