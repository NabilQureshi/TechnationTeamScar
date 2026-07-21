import { useState, useEffect } from 'react';
import { createClient } from '@/supabase/client';

export function useCalendarEvents(startDate?: Date, endDate?: Date) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 1. Get user session
        const { data: { session } } = await supabase.auth.getSession();
        
        // ✅ If no session, stop here - don't call the API
        if (!session) {
          console.log('No session - showing empty calendar');
          setEvents([]);
          setLoading(false);
          return;
        }

        // ✅ Only try to fetch if we have a session
        const syncResponse = await fetch('/api/calendar', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!syncResponse.ok) {
          const errorData = await syncResponse.json();
          console.error('Calendar sync failed:', errorData);
          // Return empty events instead of throwing
          setEvents([]);
          setLoading(false);
          return;
        }

        const syncData = await syncResponse.json();
        setEvents(syncData.events || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching calendar events:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setEvents([]);
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return { events, loading, error };
}