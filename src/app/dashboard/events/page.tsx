
import { createServer } from '@/lib/supabase/server';
import { EventsClientPage } from './client';
import { format } from 'date-fns';
import { redirect } from 'next/navigation';

export default async function EventsPage() {
  const supabase = createServer();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/login');
  }

  const { data: userRecord } = await supabase
    .from('user')
    .select('id')
    .eq('user_uuid', user.id)
    .single();

  if (!userRecord) {
    return redirect('/login');
  }
  
  const { data: orgLink } = await supabase
    .from('user_organisations')
    .select('organisation_id')
    .eq('user_id', userRecord.id)
    .maybeSingle();

  const organisationId = orgLink?.organisation_id;

  if (!organisationId) {
     return (
        <div className="flex flex-col items-center justify-center h-full">
            <p className="text-muted-foreground">You are not associated with an organization.</p>
        </div>
    );
  }

  const { data: eventsData, error: eventsError } = await supabase
    .from('events')
    .select('*, event_categories:event_category_map(name:category_id(name))')
    .eq('organiser_org_id', organisationId)
    .order('start_time', { ascending: false });

  if (eventsError) {
    console.error("Error fetching events:", eventsError);
  }

  const events = eventsData?.map(event => ({
    id: event.id,
    title: event.title,
    category: event.event_categories[0]?.name?.name ?? 'General',
    dates: `${format(new Date(event.start_time), 'MMM d, yyyy')} - ${format(new Date(event.end_time), 'MMM d, yyyy')}`,
    location: event.location_name ?? 'N/A',
    price: event.is_free ? 'Free' : `₹${event.amount}`,
    status: new Date(event.end_time) < new Date() ? 'Completed' : 'Upcoming',
  })) || [];

  return <EventsClientPage events={events} />;
}
