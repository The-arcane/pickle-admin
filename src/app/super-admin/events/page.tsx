'use client';
import { useState, useEffect, useCallback } from 'react';
import { useOrganization } from '@/hooks/use-organization';
import { createClient } from '@/lib/supabase/client';
import type { Event } from '@/types';
import { EventsClientPage } from './client';

export default function EventsPage() {
  const supabase = createClient();
  const { selectedOrgId } = useOrganization();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    if (!selectedOrgId) {
      setEvents([]);
      setLoading(false);
      return;
    };
    
    setLoading(true);
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('organiser_org_id', selectedOrgId);
    
    if (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    } else {
      setEvents(data as Event[]);
    }
    setLoading(false);
  }, [selectedOrgId, supabase]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return <EventsClientPage events={events} loading={loading} onActionFinish={fetchEvents} />;
}
