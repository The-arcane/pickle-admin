
import { createServer } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { EditEventClientPage } from '@/app/dashboard/events/[id]/client';
import type { Event } from '@/app/dashboard/events/[id]/types';

export default async function EducationEditEventPage({ params }: { params: { id: string } }) {
  const supabase = await createServer();
  const { id } = params;
  const isAdding = id === 'add';

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return redirect('/login?type=education');
    }

  let event: Event | null = null;
  
  if (!isAdding) {
    const { data: eventData, error: eventError } = await supabase
      .from('events')
      .select(`
        *,
        event_sub_events(*),
        event_what_to_bring(*),
        event_gallery_images(*)
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
      users={usersData || []}
      categories={categoriesData || []}
      tags={tagsData || []}
    />
  );
}
