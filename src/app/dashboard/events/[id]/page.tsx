import { createServer } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { EditEventClientPage } from './client';
import type { Event } from './types';

export default async function EditEventPage({ params }: { params: { id: string } }) {
  const supabase = createServer();
  const { id } = params;
  const isAdding = id === 'add';

  let event: Event | null = null;
  
  if (!isAdding) {
    const { data: eventData, error: eventError } = await supabase
      .from('events')
      .select(`
        *,
        event_sub_events(*),
        event_what_to_bring(*)
      `)
      .eq('id', id)
      .single();
    
    if (eventError || !eventData) {
      console.error('Error fetching event details:', eventError);
      notFound();
    }
    event = eventData as Event;
  }
  
  const { data: organisationsData, error: orgsError } = await supabase.from('organisations').select('id, name');
  // Fetch users for organizer dropdown
  const { data: usersData, error: usersError } = await supabase.from('user').select('id, name');
  const { data: categoriesData, error: catsError } = await supabase.from('event_categories').select('id, name');
  const { data: tagsData, error: tagsError } = await supabase.from('event_tags').select('id, name');

  if (orgsError || catsError || tagsError || usersError) {
    console.error("Error fetching related data for event form", orgsError || catsError || tagsError || usersError);
  }

  return (
    <EditEventClientPage
      event={event}
      organisations={organisationsData || []}
      users={usersData || []} // Pass users to client
      categories={categoriesData || []}
      tags={tagsData || []}
    />
  );
}
