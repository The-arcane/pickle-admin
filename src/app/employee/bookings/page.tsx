
import { EmployeeBookingsClientPage } from './client';
import { createServer } from '@/lib/supabase/server';

export default async function EmployeeBookingsPage() {
  const supabase = createServer();

  // Fetch court bookings
  const { data: courtBookingsData, error: courtBookingsError } = await supabase
    .from('bookings')
    .select(
      'id, status, user:user_id(name), courts:court_id(name), timeslots:timeslot_id(date, start_time, end_time)'
    )
    .order('id', { ascending: false });

  // Fetch only court booking statuses for the badge
  const { data: courtBookingStatusesData, error: courtStatusesError } = await supabase.from('booking_status').select('id, label');

  if (courtBookingsError || courtStatusesError) {
    console.error('Error fetching bookings data:', { courtBookingsError, courtStatusesError });
  }

  const courtBookings = courtBookingsData || [];
  const courtBookingStatuses = courtBookingStatusesData || [];

  return <EmployeeBookingsClientPage
    initialCourtBookings={courtBookings}
    courtBookingStatuses={courtBookingStatuses}
  />;
}
