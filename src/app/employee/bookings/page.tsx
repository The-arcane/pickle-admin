
import { BookingsClientPage } from '@/app/dashboard/bookings/client';
import { createServer } from '@/lib/supabase/server';

// Re-using the admin bookings page component for employees, but with read-only access.
// You might want to create a simplified, read-only version later.

export default async function EmployeeBookingsPage() {
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
    .select('id, event_id, booking_time, quantity, status, user:user_id(name), events:event_id(title)')
    .order('booking_time', { ascending: false });

  // Fetch related data for display
  const { data: courtsData, error: courtsError } = await supabase.from('courts').select('id, name');
  const { data: usersData, error: usersError } = await supabase.from('user').select('id, name');
  const { data: courtBookingStatusesData, error: courtStatusesError } = await supabase.from('booking_status').select('id, label');
  const { data: eventBookingStatusesData, error: eventStatusesError } = await supabase.from('event_booking_status').select('id, label');

  if (courtBookingsError || eventBookingsError || courtsError || usersError || courtStatusesError || eventStatusesError) {
    console.error('Error fetching bookings data:', { courtBookingsError, eventBookingsError, courtsError, usersError, courtStatusesError, eventStatusesError });
  }
  
  let eventBookings = eventBookingsData || [];
  
  if (eventBookings.length > 0) {
    const eventIds = [...new Set(eventBookings.map(b => b.event_id).filter(id => id != null))] as number[];
    
    const { data: allBookingsForEvents, error: totalsError } = await supabase
      .from('event_bookings')
      .select('event_id, quantity')
      .in('event_id', eventIds)
      .eq('status', 1);

    if (totalsError) {
      console.error("Error fetching event enrollment totals:", totalsError);
    } else if (allBookingsForEvents) {
        const totalsMap: { [key: number]: number } = {};
        allBookingsForEvents.forEach(b => {
            if(b.event_id) {
                totalsMap[b.event_id] = (totalsMap[b.event_id] || 0) + (b.quantity ?? 1);
            }
        });
      
      eventBookings = eventBookings.map(booking => ({
        ...booking,
        total_enrolled: totalsMap[booking.event_id!] || 0,
      }));
    }
  }


  const courtBookings = courtBookingsData || [];
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

