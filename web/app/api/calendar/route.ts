import { createClient } from '@/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // 1. Get the authenticated user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Get the user's access token from Supabase session
    const { data: { session } } = await supabase.auth.getSession();
    const accessToken = session?.provider_token;

    if (!accessToken) {
      // Return empty data instead of an error
      return NextResponse.json({ 
        events: [], 
        total: 0,
        new: 0,
      });
    }

    // 3. Get date range from query params (default: this month)
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start') || new Date().toISOString();
    const endDate = searchParams.get('end') || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    // 4. Fetch events from Google Calendar
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
      `timeMin=${startDate}&timeMax=${endDate}&` +
      `orderBy=startTime&singleEvents=true&maxResults=250`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('Google Calendar API error:', error);
      return NextResponse.json({ error: 'Failed to fetch calendar events' }, { status: response.status });
    }

    const data = await response.json();
    const events = data.items || [];

    console.log('Total Google Calendar events fetched:', events.length);
    if (events.length > 0) {
      console.log('Sample event:', JSON.stringify(events[0], null, 2));
    }

    // 5. Save events to Supabase
    const supabaseClient = await createClient();
    
    // Get existing event IDs to avoid duplicates
    const { data: existingEvents } = await supabaseClient
      .from('calendar_events')
      .select('google_event_id')
      .eq('user_id', user.id);

    const existingIds = new Set(existingEvents?.map(e => e.google_event_id) || []);

    // Filter events that need to be inserted
    const newEvents = events
      .filter((event: any) => !existingIds.has(event.id))
      .map((event: any) => {
        // Helper to safely parse dates
        const parseDate = (raw: string | null | undefined): string | null => {
          if (!raw || raw.trim() === '') return null;
          const d = new Date(raw);
          if (isNaN(d.getTime())) return null;
          // Return ISO string WITHOUT converting to UTC
          // This preserves the original local time
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          const hours = String(d.getHours()).padStart(2, '0');
          const minutes = String(d.getMinutes()).padStart(2, '0');
          const seconds = String(d.getSeconds()).padStart(2, '0');
          return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
        };

        // Check if this is an ALL-DAY event (has 'date' instead of 'dateTime')
        const isAllDay = !!event.start?.date && !event.start?.dateTime;

        let startTime: string | null;
        let endTime: string | null;

        if (isAllDay) {
          // For all-day events, use the date directly with midnight times
          // Google gives us just "2026-07-25" — store it as midnight LOCAL
          startTime = event.start.date + 'T00:00:00';
          endTime = event.end.date + 'T00:00:00';
        } else {
          // For timed events, parse normally preserving local time
          startTime = parseDate(event.start?.dateTime) ?? parseDate(event.start?.date);
          endTime = parseDate(event.end?.dateTime) ?? parseDate(event.end?.date);
        }

        // Skip if either time is invalid
        if (!startTime || !endTime) {
          console.log('Skipping event with invalid time:', event.summary || 'Untitled', {
            start: event.start,
            end: event.end,
          });
          return null;
        }
        
        return {
          user_id: user.id,
          google_event_id: event.id,
          title: event.summary || 'Untitled Event',
          description: event.description || '',
          start_time: startTime,
          end_time: endTime,
          is_confirmed: event.status === 'confirmed',
          created_at: new Date().toISOString(),
        };
      })
      .filter((event: any) => event !== null);

    console.log('Events to insert:', newEvents.length);
    if (newEvents.length > 0) {
      console.log('Sample new event:', JSON.stringify(newEvents[0], null, 2));
    }

      // Insert new events
    if (newEvents.length > 0) {
      const { error: insertError } = await supabaseClient
        .from('calendar_events')
        .insert(newEvents);

      if (insertError) {
        console.error('Error inserting events:', insertError);
      }
    } 

    // Return ALL events from the database, not just new ones
    const { data: allEvents, error: fetchError } = await supabaseClient
      .from('calendar_events')
      .select('*')
      .eq('user_id', user.id)
      .order('start_time', { ascending: true });

    if (fetchError) {
      console.error('Error fetching events:', fetchError);
    }

    return NextResponse.json({ 
      events: allEvents || [],
      total: events.length,
      new: newEvents.length,
    });
  } catch (error) {
    console.error('Calendar sync error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}