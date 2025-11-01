
import { EventsClientPage } from './client';
import { createServer } from '@/lib/supabase/server';
import { format } from 'date-fns';
import { redirect } from 'next/navigation';

export default async function ArenaEventsPage() {
  const supabase = await createServer();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/login?type=arena');
  }

  const { data: userRecord } = await supabase
    .from('user')
    .select('id')
    .eq('user_uuid', user.id)
    .single();

  const { data: orgLink } = await supabase
    .from('user_organisations')
    .select('organisation_id')
    .eq('user_id', userRecord?.id ?? -1)
    .maybeSingle();

  const organisationId = orgLink?.organisation_id;

  let eventsData: any[] | null = [];
  let eventsError: any = null;

  if (organisationId) {
    const { data, error } = await supabase
      .from('events')
      .select('*, event_categories:event_category_map(name:category_id(name))')
      .eq('organiser_org_id', organisationId)
      .order('start_time', { ascending: false });

      eventsData = data;
      eventsError = error;
  } else {
      console.log("Arena admin is not linked to an organization, cannot fetch events.");
  }


  if (eventsError) {
    console.error("Error fetching events:", eventsError);
  }

  const events = eventsData?.map(event => {
    if(event.title === null) return null;
    return {
        id: event.id,
        title: event.title,
        category: event.event_categories[0]?.name?.name ?? 'General',
        dates: `${format(new Date(event.start_time), 'MMM d, yyyy')} - ${format(new Date(event.end_time), 'MMM d, yyyy')}`,
        location: event.location_name ?? 'N/A',
        price: event.is_free ? 'Free' : `₹${event.amount}`,
        status: new Date(event.end_time) < new Date() ? 'Completed' : 'Upcoming',
        is_public: event.is_public
    };
  }).filter(Boolean) as any[] || [];

  return <EventsClientPage events={events} basePath="/arena" />;
}
