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

    // Fetch user's calendar events for context
    const { createClient } = await import('@/supabase/server');
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    let calendarContext = 'USER HAS NOT CONNECTED THEIR CALENDAR. Do not make up events.';
    if (user) {
      const { data: events } = await supabase
        .from('calendar_events')
        .select('title, start_time, end_time')
        .eq('user_id', user.id)
        .order('start_time', { ascending: true })
        .limit(50);

      if (events && events.length > 0) {
        calendarContext = `USER'S ACTUAL CALENDAR EVENTS (only reference these, do not make up events):\n${events.map((e: any) => {
          const start = new Date(e.start_time);
          const end = new Date(e.end_time);
          const today = new Date();
          const isToday = start.toDateString() === today.toDateString();
          const label = isToday ? 'TODAY' : start.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
          return `- ${label}: "${e.title}" from ${start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} to ${end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
        }).join('\n')}`;
      } else {
        calendarContext = 'USER HAS NO UPCOMING EVENTS. Do not make up events. Say their calendar is empty if asked.';
      }
    }

    // Convert your message history to Gemini's format
    const contents = [];

    for (const msg of history.slice(-10)) {
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      });
    }

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
            text: `You are Solace, a warm, supportive mental wellness companion. Be gentle, empathetic, and helpful. Offer emotional support and practical coping strategies. You will also need to be able to suggest events for the user's schedule if they so ask anything about goals or habits that should improve their future. Keep responses concise and warm, if need be use multiple paragraphs.

IMPORTANT RULES ABOUT CALENDAR:
- ONLY reference events from the user's actual calendar provided below.
- NEVER invent, guess, or hallucinate events.
- If asked about their schedule and the calendar is empty, say "Your calendar looks clear for now."
- Today's date is ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}.

${calendarContext}`
          }]
        }
      }),
    });

    const data = await response.json();

    if (data.candidates?.[0]?.finishReason) {
      console.log('Gemini finish reason:', data.candidates[0].finishReason);
    }

    if (!response.ok) {
      console.error('Gemini API error:', data);
      throw new Error(data.error?.message || 'API request failed');
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm here for you. Could you tell me more about how you're feeling?";

    return Response.json({ reply, emotion });
  } catch (e: any) {
    console.error('Chat error:', e);
    return Response.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}