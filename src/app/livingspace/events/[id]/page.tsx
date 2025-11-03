
import { createServer } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { EditEventClientPage } from '@/app/super-admin/events/[id]/client';
import type { Event, Organisation, User } from './types';

export default async function LivingspaceEditEventPage({ params }: { params: { id: string } }) {
  const supabase = await createServer();
  const { id } = params;
  const isAdding = id === 'add';

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/login?type=livingspace');
  }

  const { data: userProfile } = await supabase.from('user').select('id, name').eq('user_uuid', user.id).single();
  if (!userProfile) {
    notFound();
  }
  
  const { data: orgLink } = await supabase.from('user_organisations').select('organisation_id').eq('user_id', userProfile.id).single();
  if (!orgLink) {
    return <p>You are not associated with any organization.</p>;
  }
  const organisationId = orgLink.organisation_id;
  
  const { data: organisationData } = await supabase.from('organisations').select('id, name').eq('id', organisationId).single();


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
      .eq('organiser_org_id', organisationId)
      .single();
    
    if (eventError || !eventData) {
      console.error('Error fetching event details for livingspace:', eventError);
      notFound();
    }
    event = eventData as Event;
  }
  
  // Livingspace admins can only create events for their own org and as themselves.
  return (
    <EditEventClientPage
      event={event}
      organisations={organisationData ? [organisationData] : []}
      users={[userProfile as User]}
      categories={[]}
      tags={[]}
      basePath="/livingspace"
      organisationId={organisationId}
    />
  );
}
