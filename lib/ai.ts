import "server-only";
import type { Classification } from "./classifier";

/**
 * Optional AI enhancement. If AI_API_KEY is set, an OpenAI-compatible chat
 * completions endpoint is asked for a short advisory note for administrators.
 * The AI NEVER changes the priority — the rule-based engine stays authoritative,
 * and any failure silently falls back to rules only.
 */
export function aiEnabled() {
  return Boolean(process.env.AI_API_KEY);
}

export async function aiAdvisoryNote(input: {
  categoryName: string;
  title: string;
  description: string;
  classification: Classification;
}): Promise<string | null> {
  if (!aiEnabled()) return null;
  const base = process.env.AI_API_BASE_URL || "https://api.openai.com/v1";
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);
  try {
    const res = await fetch(`${base.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL || "gpt-4o-mini",
        temperature: 0.2,
        max_tokens: 160,
        messages: [
          {
            role: "system",
            content:
              "You assist a university campus security desk in an ACADEMIC PROTOTYPE. In at most 2 sentences, give practical next-step advice for the responder. Do not change the priority. Do not invent facts.",
          },
          {
            role: "user",
            content: `Category: ${input.categoryName}\nPriority (rule engine): ${input.classification.priority}\nTitle: ${input.title}\nDescription: ${input.description}`,
          },
        ],
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const text = data.choices?.[0]?.message?.content?.trim();
    return text ? text.slice(0, 500) : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
