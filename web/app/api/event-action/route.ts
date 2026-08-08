import { createClient } from '@/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { pendingEventId, action } = await request.json();

    const { data: pendingEvent } = await supabase
      .from('pending_events')
      .select('*')
      .eq('id', pendingEventId)
      .eq('user_id', user.id)
      .single();

    if (!pendingEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (action === 'approve') {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.provider_token;

      if (!accessToken) {
        return NextResponse.json({ error: 'No Google access' }, { status: 401 });
      }

      const eventBody: any = {
        summary: pendingEvent.title,
        start: { dateTime: pendingEvent.start_time, timeZone: 'America/Toronto' },
        end: { dateTime: pendingEvent.end_time, timeZone: 'America/Toronto' },
      };

      if (pendingEvent.recurrence_rule) {
        eventBody.recurrence = [pendingEvent.recurrence_rule];
      }

      const googleResponse = await fetch(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(eventBody),
        }
      );

      if (!googleResponse.ok) {
        const error = await googleResponse.json();
        console.error('Google create error:', error);
        return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
      }

      await supabase
        .from('pending_events')
        .update({ status: 'approved' })
        .eq('id', pendingEventId);

      return NextResponse.json({ success: true, status: 'approved' });
    } else {
      await supabase
        .from('pending_events')
        .update({ status: 'rejected' })
        .eq('id', pendingEventId);

      return NextResponse.json({ success: true, status: 'rejected' });
    }
  } catch (error) {
    console.error('Approve/reject error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}