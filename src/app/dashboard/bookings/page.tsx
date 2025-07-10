
import { createServer } from '@/lib/supabase/server';
import { BookingsClientPage } from './client';
import { redirect } from 'next/navigation';

export default async function BookingsPage() {
  const supabase = createServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/login');
  }

  // Get user's internal ID from their auth UUID
  const { data: userRecord } = await supabase
    .from('user')
    .select('id')
    .eq('user_uuid', user.id)
    .single();

  if (!userRecord) {
    // This case should be handled by the layout, but as a safeguard:
    return redirect('/login');
  }
  
  // Get the organization ID from the join table
  const { data: orgLink } = await supabase
    .from('user_organisations')
    .select('organisation_id')
    .eq('user_id', userRecord.id)
    .maybeSingle();

  const organisationId = orgLink?.organisation_id;

  if (!organisationId) {
    // This should not happen for a valid admin, but handle it gracefully
    return (
        <div className="flex flex-col items-center justify-center h-full">
            <p className="text-muted-foreground">You are not associated with an organization.</p>
        </div>
    );
  }

  // Fetch court bookings for the admin's organization
  const { data: courtBookingsData, error: courtBookingsError } = await supabase
    .from('bookings')
    .select(
      'id, status, court_id, timeslot_id, user:user_id(name), courts:court_id!inner(name), timeslots:timeslot_id(date, start_time, end_time)'
    )
    .eq('courts.organisation_id', organisationId)
    .order('id', { ascending: false });

  // Fetch event bookings for the admin's organization
  const { data: eventBookingsData, error: eventBookingsError } = await supabase
    .from('event_bookings')
    .select('id, event_id, booking_time, quantity, status, user:user_id(name), events:event_id!inner(title)')
    .eq('events.organiser_org_id', organisationId)
    .order('booking_time', { ascending: false });

  // Fetch related data for forms and display, scoped to the organization
  const { data: courtsData, error: courtsError } = await supabase.from('courts').select('id, name').eq('organisation_id', organisationId);
  const { data: orgUsersData, error: usersError } = await supabase
    .from('user_organisations')
    .select('user!inner(id, name)')
    .eq('organisation_id', organisationId)
    .eq('user.user_type', 1); // Assuming user_type 1 are the bookable users

  const users = orgUsersData?.map(u => u.user).filter(Boolean) || [];

  const { data: courtBookingStatusesData, error: courtStatusesError } = await supabase.from('booking_status').select('id, label');
  const { data: eventBookingStatusesData, error: eventStatusesError } = await supabase.from('event_booking_status').select('id, label');

  if (courtBookingsError || eventBookingsError || courtsError || usersError || courtStatusesError || eventStatusesError) {
    console.error('Error fetching bookings data:', { courtBookingsError, eventBookingsError, courtsError, usersError, courtStatusesError, eventStatusesError });
  }

  let eventBookings = eventBookingsData || [];

  // Calculate total enrollments for each event that has a booking
  if (eventBookings.length > 0) {
    const eventIds = [...new Set(eventBookings.map(b => b.event_id).filter(id => id != null))] as number[];
    
    if (eventIds.length > 0) {
        // Fetch all confirmed bookings for these events to calculate totals
        const { data: allBookingsForEvents, error: totalsError } = await supabase
        .from('event_bookings')
        .select('event_id, quantity')
        .in('event_id', eventIds)
        .eq('status', 1); // Assuming 1 is 'Confirmed' for event bookings

        if (totalsError) {
        console.error("Error fetching event enrollment totals:", totalsError);
        } else if (allBookingsForEvents) {
            const totalsMap: { [key: number]: number } = {};
            allBookingsForEvents.forEach(b => {
                if(b.event_id) {
                    totalsMap[b.event_id] = (totalsMap[b.event_id] || 0) + (b.quantity ?? 1);
                }
            });
        
        // Augment the eventBookings data with the total
        eventBookings = eventBookings.map(booking => ({
            ...booking,
            total_enrolled: totalsMap[booking.event_id!] || 0,
        }));
        }
    }
  }


  const courtBookings = courtBookingsData || [];
  const courts = courtsData || [];
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
