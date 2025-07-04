import { createServer } from '@/lib/supabase/server';
import { BookingsClientPage } from './client';

export default async function BookingsPage() {
  const supabase = createServer();
  const { data, error } = await supabase
    .from('bookings')
    .select(
      'id, status, court_id, timeslot_id, user:user_id(name), courts:court_id(name), timeslots:timeslot_id(date, start_time, end_time)'
    )
    .order('id', { ascending: false });

  const { data: courtsData, error: courtsError } = await supabase.from('courts').select('id, name');
  const { data: usersData, error: usersError } = await supabase.from('user').select('id, name').eq('user_type', 1);

  if (error || courtsError || usersError) {
    console.error('Error fetching data:', error || courtsError || usersError);
  }

  const bookings = data || [];
  const courts = courtsData || [];
  const users = usersData || [];

  return <BookingsClientPage bookings={bookings} courts={courts} users={users} />;
}
