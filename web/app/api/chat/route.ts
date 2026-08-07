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
            text: `You are Solace, a warm, supportive mental wellness companion. Be gentle, empathetic, and helpful. Never give medical advice, but offer emotional support and practical coping strategies. Keep responses concise and warm.

            CALENDAR RULES:
            - ONLY reference events from the user's actual calendar provided below.
            - NEVER invent, guess, or hallucinate events.
            - Today's date is ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}.

            SCHEDULING RULES:
            When the user asks you to create or suggest events (workouts, meetings, habits, etc.):
            1. Check their calendar for conflicts
            2. Propose specific times that don't overlap with existing events
            3. End your response with a JSON block containing the proposed events

            Use this EXACT format at the END of your message when proposing events. DATES MUST BE ISO FORMAT like "2026-08-07T08:00:00". Do NOT use words for dates.

            ---EVENTS---
            [
              {
                "title": "Morning Workout",
                "start": "2026-08-07T08:00:00",
                "end": "2026-08-07T09:00:00",
                "recurrence": "RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR"
              }
            ]
            ---END---

            CRITICAL: The start and end MUST be valid ISO 8601 date strings like "2026-08-07T08:00:00". 
            Never use "August 7" or any other text format. Use numbers only: YYYY-MM-DDTHH:MM:SS.
            Today is ${new Date().toISOString().split('T')[0]}.

            Only include the JSON block if you're actually proposing events. Do not include it in normal conversation.
            The recurrence field is optional - only include it for repeating events.

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

    // Extract event proposals from the reply
    let replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm here for you. Could you tell me more about how you're feeling?";
    let proposedEvents: any[] = [];

    const eventsMatch = replyText.match(/---EVENTS---\s*([\s\S]*?)\s*---END---/);

    if (eventsMatch) {
      try {
        proposedEvents = JSON.parse(eventsMatch[1]);
        console.log('Raw events from AI:', JSON.stringify(proposedEvents, null, 2));
        
        // Remove the JSON block from the displayed message
        replyText = replyText.replace(/---EVENTS---[\s\S]*?---END---/, '').trim();
        
        // Save proposed events to database
        if (user && proposedEvents.length > 0) {
          const pendingEvents = proposedEvents.map((e: any, index: number) => {
            // Validate and fix dates
            const startDate = new Date(e.start);
            const endDate = new Date(e.end);
            
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
              console.error(`Event ${index} has invalid dates:`, e.start, e.end);
              return null;
            }
            
            // Convert to proper format
            const year = startDate.getFullYear();
            const month = String(startDate.getMonth() + 1).padStart(2, '0');
            const day = String(startDate.getDate()).padStart(2, '0');
            const startHours = String(startDate.getHours()).padStart(2, '0');
            const startMins = String(startDate.getMinutes()).padStart(2, '0');
            
            const endYear = endDate.getFullYear();
            const endMonth = String(endDate.getMonth() + 1).padStart(2, '0');
            const endDay = String(endDate.getDate()).padStart(2, '0');
            const endHours = String(endDate.getHours()).padStart(2, '0');
            const endMins = String(endDate.getMinutes()).padStart(2, '0');
            
            return {
              user_id: user.id,
              message_id: Date.now().toString() + index,
              title: e.title || 'Untitled Event',
              description: e.description || '',
              start_time: `${year}-${month}-${day}T${startHours}:${startMins}:00`,
              end_time: `${endYear}-${endMonth}-${endDay}T${endHours}:${endMins}:00`,
              recurrence_rule: e.recurrence || null,
              status: 'pending',
            };
          }).filter(Boolean);
          
          const validEvents = pendingEvents.filter((e: any) => e !== null);
          if (validEvents.length > 0) {
            const { data: inserted, error: insertErr } = await supabase
              .from('pending_events')
              .insert(validEvents)
              .select('id, title, start_time, end_time, recurrence_rule, status');
            
            if (insertErr) {
              console.error('Failed to insert pending events:', insertErr);
              // Fallback: use temp IDs so UI still works
              proposedEvents = validEvents.map((e: any, i: number) => ({
                id: `temp-${Date.now()}-${i}`,
                title: e.title,
                start_time: e.start_time,
                end_time: e.end_time,
                recurrence_rule: e.recurrence_rule || null,
                status: 'pending',
              }));
            } else if (inserted) {
              proposedEvents = inserted;
            } else {
              // Nothing returned, use fallback
              proposedEvents = validEvents.map((e: any, i: number) => ({
                id: `temp-${Date.now()}-${i}`,
                title: e.title,
                start_time: e.start_time,
                end_time: e.end_time,
                recurrence_rule: e.recurrence_rule || null,
                status: 'pending',
              }));
            }
          }
        }
      } catch (e) {
        console.error('Failed to parse event proposals:', e);
      }
    }

    if (eventsMatch) {
      console.log('Raw events JSON from AI:', eventsMatch[1]);
    }

    return Response.json({ reply: replyText, emotion, proposedEvents });
  } catch (e: any) {
    console.error('Chat error:', e);
    return Response.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}