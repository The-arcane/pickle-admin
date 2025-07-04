import { createServer } from '@/lib/supabase/server';
import { BookingsClientPage } from './client';

export default async function BookingsPage() {
  const supabase = createServer();
  const { data, error } = await supabase
    .from('bookings')
    .select(
      'id, status, user:user_id(name), courts:court_id(name), timeslots:timeslot_id(date, start_time)'
    );

  if (error) {
    console.error('Error fetching bookings:', error);
  }

  const bookings = data || [];

  return <BookingsClientPage bookings={bookings} />;
}
