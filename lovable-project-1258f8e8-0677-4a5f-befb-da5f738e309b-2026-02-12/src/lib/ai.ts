import OpenAI from "openai";

const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";

interface AIRequestOptions {
  systemPrompt: string;
  userPrompt: string;
}

/** Try Ollama first, fall back to OpenAI */
export async function generateAIResponse({
  systemPrompt,
  userPrompt,
}: AIRequestOptions): Promise<string> {
  // Try Ollama
  try {
    const res = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.1",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: false,
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (res.ok) {
      const data = await res.json();
      const content = data.message?.content;
      if (content) return content;
    }
  } catch {
    // Ollama unavailable — fall through to OpenAI
  }

  // OpenAI fallback
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("No AI backend available (Ollama down, no OpenAI key)");
  }

  const openai = new OpenAI({ apiKey });
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 1024,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("OpenAI returned empty response");
  return content;
}

interface ClassificationResult {
  category: "price_only" | "inspection" | "multi_question" | "other";
  temperature: "hot" | "warm" | "cold";
  isInspectionRequest: boolean;
  isOfferIntent: boolean;
}

export async function classifyEmail(
  body: string,
  threadHistory: string[] = []
): Promise<ClassificationResult> {
  const historyContext =
    threadHistory.length > 0
      ? `\nPrevious messages in thread:\n${threadHistory.join("\n---\n")}\n`
      : "";

  const response = await generateAIResponse({
    systemPrompt: `You are a real estate email classifier. Analyze the email and return ONLY valid JSON with these fields:
- category: "price_only" | "inspection" | "multi_question" | "other"
- temperature: "hot" | "warm" | "cold"
- isInspectionRequest: boolean
- isOfferIntent: boolean

Classification rules:
- "hot": Mentions inspection, open home, offer, contract, or shows strong buying intent
- "warm": Asks follow-up questions, requests more info, shows continued interest
- "cold": Generic first enquiry, price-only request, no engagement signals
- isInspectionRequest: true if they explicitly ask to inspect or attend open home
- isOfferIntent: true if they mention making an offer or discuss price negotiation`,
    userPrompt: `${historyContext}\nNew email:\n${body}`,
  });

  try {
    const cleaned = response.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return {
      category: "other",
      temperature: "cold",
      isInspectionRequest: false,
      isOfferIntent: false,
    };
  }
}

export async function draftReply(
  body: string,
  threadHistory: string[] = [],
  agentName: string,
  propertyAddress?: string,
  priceGuide?: string
): Promise<string> {
  const historyContext =
    threadHistory.length > 0
      ? `\nPrevious messages in thread:\n${threadHistory.join("\n---\n")}\n`
      : "";

  const propertyInfo = [
    propertyAddress ? `Property: ${propertyAddress}` : "",
    priceGuide ? `Price guide: ${priceGuide}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return generateAIResponse({
    systemPrompt: `You are a helpful real estate agent assistant. Draft a professional, friendly email reply.
Keep it concise (2-4 short paragraphs). Be warm but professional.
Sign off as "${agentName}".
${propertyInfo ? `\nProperty details:\n${propertyInfo}` : ""}
Do NOT include a subject line. Just the body text.`,
    userPrompt: `${historyContext}\nNew email to reply to:\n${body}`,
  });
}
