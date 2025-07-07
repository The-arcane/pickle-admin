
import { EmployeeEventsClientPage } from './client';
import { createServer } from '@/lib/supabase/server';
import { format } from 'date-fns';

// Re-using the admin events page component for employees.
export default async function EmployeeEventsPage() {
  const supabase = createServer();
  
  const { data: eventsData, error: eventsError } = await supabase
    .from('events')
    .select('*, event_categories:event_category_map(name:category_id(name))')
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

  return <EmployeeEventsClientPage events={events} />;
}
