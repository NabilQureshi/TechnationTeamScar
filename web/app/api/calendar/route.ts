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
    const startDate = searchParams.get('start') || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = searchParams.get('end') || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();

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
    
    // Get existing events (with their updated timestamps)
    const { data: existingEvents } = await supabaseClient
      .from('calendar_events')
      .select('google_event_id, updated_at')
      .eq('user_id', user.id);

    // Create a map of google_event_id -> updated_at from database
    const existingMap = new Map(
      existingEvents?.map(e => [e.google_event_id, e.updated_at]) || []
    );

    const newEvents: any[] = [];
    const updatedEvents: any[] = [];

    events.forEach((event: any) => {
      const helper = (raw: string | null | undefined): string | null => {
        if (!raw || raw.trim() === '') return null;
        const d = new Date(raw);
        if (isNaN(d.getTime())) return null;
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
      };

      const isAllDay = !!event.start?.date && !event.start?.dateTime;
      let startTime: string | null;
      let endTime: string | null;

      if (isAllDay) {
        startTime = event.start.date + 'T00:00:00';
        endTime = event.end.date + 'T00:00:00';
      } else {
        startTime = helper(event.start?.dateTime) ?? helper(event.start?.date);
        endTime = helper(event.end?.dateTime) ?? helper(event.end?.date);
      }

      if (!startTime || !endTime) return;

      const eventData = {
        user_id: user.id,
        google_event_id: event.id,
        title: event.summary || 'Untitled Event',
        description: event.description || '',
        start_time: startTime,
        end_time: endTime,
        is_confirmed: event.status === 'confirmed',
        updated_at: event.updated,
        created_at: new Date().toISOString(),
      };

      const storedUpdatedAt = existingMap.get(event.id);

      if (!existingMap.has(event.id)) {
        // Truly new event
        newEvents.push(eventData);
      } else if (storedUpdatedAt !== event.updated) {
        // Exists but modified (or was NULL)
        updatedEvents.push(eventData);
      }
      // else: unchanged, skip
    });

    // Detect deleted events (in DB but not in Google's response)
    const googleEventIds = new Set(events.map((e: any) => e.id));
    const staleIds = existingEvents
      ?.filter(e => !googleEventIds.has(e.google_event_id))
      .map(e => e.google_event_id) || [];

    // Insert new events
    if (newEvents.length > 0) {
      const { error } = await supabaseClient
        .from('calendar_events')
        .insert(newEvents);
      if (error) console.error('Error inserting events:', error);
    }

    // Update modified events
    for (const event of updatedEvents) {
      const { error } = await supabaseClient
        .from('calendar_events')
        .update({
          title: event.title,
          description: event.description,
          start_time: event.start_time,
          end_time: event.end_time,
          is_confirmed: event.is_confirmed,
          updated_at: event.updated_at,
        })
        .eq('google_event_id', event.google_event_id)
        .eq('user_id', user.id);
      if (error) console.error('Error updating event:', error);
    }

    // Delete stale events
    if (staleIds.length > 0) {
      const { error: deleteError } = await supabaseClient
        .from('calendar_events')
        .delete()
        .eq('user_id', user.id)
        .in('google_event_id', staleIds);
      if (error) console.error('Error deleting stale events:', deleteError);
    }

    console.log(`Sync complete — New: ${newEvents.length}, Updated: ${updatedEvents.length}, Deleted: ${staleIds.length}`);

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
      updated: updatedEvents.length,
      deleted: staleIds.length,
    });
  } catch (error) {
    console.error('Calendar sync error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}