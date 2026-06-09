export const runtime = "nodejs";

function detectEmotion(text: string): "anxious" | "sad" | "pessimistic" | "neutral" {
  const t = text.toLowerCase();
  if (/(anxious|panic|worried|overthink|stress|stressed|nervous)/.test(t)) return "anxious";
  if (/(sad|hopeless|empty|alone|cry|depressed)/.test(t)) return "sad";
  if (/(pointless|never works|always fails|no future|i can't)/.test(t)) return "pessimistic";
  return "neutral";
}

export async function POST(req: Request) {
  try {
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
      throw new Error("Missing GEMINI_API_KEY in .env.local");
    }

    const { message, history = [] } = await req.json();
    const text = String(message ?? "").trim();
    if (!text) return Response.json({ error: "Empty message" }, { status: 400 });

    const emotion = detectEmotion(text);

    // Convert your message history to Gemini's format
    const contents = [];

    // Add conversation history (excluding the system prompt)
    for (const msg of history.slice(-10)) {
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      });
    }

    // Add the current user message
    contents.push({
      role: 'user',
      parts: [{ text: text }]
    });

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
          topP: 0.95,
        },
        system_instruction: {
          parts: [{ 
            text: 'You are Solace, a warm, supportive mental wellness companion. Be gentle, empathetic, and helpful. Never give medical advice, but offer emotional support and practical coping strategies. Keep responses concise and warm, about a paragraph long at most.' 
          }]
        }
      }),
    });

    const data = await response.json();

    // Check for errors
    if (!response.ok) {
      console.error('Gemini API error:', data);
      throw new Error(data.error?.message || 'API request failed');
    }

    // Extract the reply from Gemini's response
    const reply = data.candidates[0]?.content?.parts[0]?.text || "I'm here for you. Could you tell me more about how you're feeling?";

    return Response.json({ reply, emotion });
  } catch (e: any) {
    console.error('Chat error:', e);
    return Response.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}