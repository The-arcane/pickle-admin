
import { createServer } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { EditEventClientPage } from './client';
import type { Event, Organisation, User } from './types';

export default async function ArenaEditEventPage({ params }: { params: { id: string } }) {
  const supabase = await createServer();
  const { id } = params;
  const isAdding = id === 'add';

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/login?type=arena');
  }

  const { data: userProfile } = await supabase.from('user').select('id, name').eq('user_uuid', user.id).single();
  if (!userProfile) {
    notFound();
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
      console.error('Error fetching event details for arena:', eventError);
      notFound();
    }
    event = eventData as Event;
  }
  
  return (
    <EditEventClientPage
      event={event}
      organisations={[]} // Arena admins can only create events for their own org
      users={[userProfile as User]} // Only the current admin can be an organizer
      categories={[]}
      tags={[]}
    />
  );
}
