import { createServer } from '@/lib/supabase/server';
import { BookingsClientPage } from './client';

export default async function BookingsPage() {
  const supabase = createServer();

  // Fetch court bookings
  const { data: courtBookingsData, error: courtBookingsError } = await supabase
    .from('bookings')
    .select(
      'id, status, court_id, timeslot_id, user:user_id(name), courts:court_id(name), timeslots:timeslot_id(date, start_time, end_time)'
    )
    .order('id', { ascending: false });

  // Fetch event bookings
  const { data: eventBookingsData, error: eventBookingsError } = await supabase
    .from('event_bookings')
    .select('id, booking_time, quantity, status, user:user_id(name), events:event_id(title)')
    .order('booking_time', { ascending: false });

  // Fetch related data for forms and display
  const { data: courtsData, error: courtsError } = await supabase.from('courts').select('id, name');
  const { data: usersData, error: usersError } = await supabase.from('user').select('id, name').eq('user_type', 1);
  const { data: courtBookingStatusesData, error: courtStatusesError } = await supabase.from('booking_status').select('id, label');
  const { data: eventBookingStatusesData, error: eventStatusesError } = await supabase.from('event_booking_status').select('id, label');

  if (courtBookingsError || eventBookingsError || courtsError || usersError || courtStatusesError || eventStatusesError) {
    console.error('Error fetching bookings data:', { courtBookingsError, eventBookingsError, courtsError, usersError, courtStatusesError, eventStatusesError });
  }

  const courtBookings = courtBookingsData || [];
  const eventBookings = eventBookingsData || [];
  const courts = courtsData || [];
  const users = usersData || [];
  const courtBookingStatuses = courtBookingStatusesData || [];
  const eventBookingStatuses = eventBookingStatusesData || [];

  return <BookingsClientPage
    initialCourtBookings={courtBookings}
    initialEventBookings={eventBookings}
    courts={courts}
    users={users}
    courtBookingStatuses={courtBookingStatuses}
    eventBookingStatuses={eventBookingStatuses}
  />;
}
