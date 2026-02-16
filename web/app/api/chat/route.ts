export const runtime = "nodejs";

const BASE_URL = process.env.BACKBOARD_BASE_URL || "https://app.backboard.io/api";
const API_KEY = process.env.BACKBOARD_API_KEY;

if (!API_KEY) {
  throw new Error("Missing BACKBOARD_API_KEY in .env.local");
}

function detectEmotion(text: string): "anxious" | "sad" | "pessimistic" | "neutral" {
  const t = text.toLowerCase();
  if (/(anxious|panic|worried|overthink|stress|stressed|nervous)/.test(t)) return "anxious";
  if (/(sad|hopeless|empty|alone|cry|depressed)/.test(t)) return "sad";
  if (/(pointless|never works|always fails|no future|i can't)/.test(t)) return "pessimistic";
  return "neutral";
}

async function bbPost(path: string, body: any) {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status}: ${text}`);
    }
  
    return res.json();
  }
  

/**
 * Hackathon shortcut:
 * - Create ONE assistant and cache its id in memory.
 * - In production: store assistant/thread ids in DB (Firebase).
 */
let assistantIdCache: string | null = null;

async function getOrCreateAssistant(): Promise<string> {
  if (assistantIdCache) return assistantIdCache;

  const systemPrompt =
    "You are Solace, a supportive wellbeing companion (not a clinician). " +
    "Be calm, friendly, and practical. Ask 1–2 short questions. Offer small actionable steps. " +
    "If user is in immediate danger, encourage contacting local emergency services or a trusted person.";

  // NOTE: If this endpoint 404s, Backboard may use a different REST path.
  // The flow (assistant -> thread -> message) is correct; adjust paths to match your Backboard docs.
  const assistant = await bbPost("/assistants", {
    name: "Solace",
    system_prompt: systemPrompt,
  });

  assistantIdCache = assistant.assistant_id || assistant.id;
  if (!assistantIdCache) throw new Error("Could not read assistant_id from Backboard response.");
  return assistantIdCache;
}

async function createThread(assistantId: string): Promise<string> {
  const thread = await bbPost("/threads", { assistant_id: assistantId });
  const threadId = thread.thread_id || thread.id;
  if (!threadId) throw new Error("Could not read thread_id from Backboard response.");
  return threadId;
}

export async function POST(req: Request) {
  try {
    const { message, threadId } = await req.json();
    const text = String(message ?? "").trim();
    if (!text) return Response.json({ error: "Empty message" }, { status: 400 });

    const emotion = detectEmotion(text);

    const assistantId = await getOrCreateAssistant();
    const useThreadId = threadId || (await createThread(assistantId));

    const resp = await bbPost("/messages", {
      thread_id: useThreadId,
      content: text,
      llm_provider: "openai",
      model_name: "gpt-4o-mini",
      stream: false,
      memory: "Auto",
    });

    const reply =
      resp?.content ||
      resp?.message?.content ||
      resp?.output_text ||
      "No reply returned.";

    return Response.json({ reply, emotion, threadId: useThreadId });
  } catch (e: any) {
    return Response.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}
