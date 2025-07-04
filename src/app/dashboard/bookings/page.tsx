import { createServer } from '@/lib/supabase/server';
import { BookingsClientPage } from './client';

export default async function BookingsPage() {
  const supabase = createServer();
  const { data, error } = await supabase
    .from('bookings')
    .select(
      'id, status, court_id, timeslot_id, user:user_id(name), courts:court_id(name), timeslots:timeslot_id(date, start_time, end_time)'
    );

  const { data: courtsData, error: courtsError } = await supabase.from('courts').select('id, name');

  if (error || courtsError) {
    console.error('Error fetching data:', error || courtsError);
  }

  const bookings = data || [];
  const courts = courtsData || [];

  return <BookingsClientPage bookings={bookings} courts={courts} />;
}
