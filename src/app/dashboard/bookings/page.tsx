
import { createServer } from '@/lib/supabase/server';
import { BookingsClientPage } from './client';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function BookingsPage() {
  const supabase = await createServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/login');
  }

  const { data: adminProfile } = await supabase
    .from('user')
    .select('organisation_id')
    .eq('user_uuid', user.id)
    .single();

  if (!adminProfile || !adminProfile.organisation_id) {
    return redirect('/login?error=Your%20admin%20account%20is%20not%20associated%20with%20a%20Living%20Space.');
  }
  
  const organisationId = adminProfile.organisation_id;

  // Fetch all necessary data in parallel
  const [
    courtBookingsRes,
    eventBookingsRes,
    courtsRes,
    usersRes,
    courtStatusesRes,
    eventStatusesRes,
  ] = await Promise.all([
    supabase
      .from('bookings')
      .select('id, booking_status, court_id, timeslot_id, user:user_id(name), courts:court_id!inner(name, organisation_id), timeslots:timeslot_id(date, start_time, end_time)')
      .eq('courts.organisation_id', organisationId)
      .order('id', { ascending: false }),
    supabase
      .from('event_bookings')
      .select('id, event_id, booking_time, quantity, status, user:user_id(name), events:event_id!inner(title, organiser_org_id)')
      .eq('events.organiser_org_id', organisationId)
      .order('booking_time', { ascending: false }),
    supabase.from('courts').select('id, name').eq('organisation_id', organisationId),
    supabase.from('user').select('id, name').eq('organisation_id', organisationId), // Fetch all users from the same org
    supabase.from('booking_status').select('id, label'),
    supabase.from('event_booking_status').select('id, label'),
  ]);

  if (courtBookingsRes.error) console.error('Error fetching court bookings:', courtBookingsRes.error);
  if (eventBookingsRes.error) console.error('Error fetching event bookings:', eventBookingsRes.error);
  if (courtsRes.error) console.error('Error fetching courts:', courtsRes.error);
  if (usersRes.error) console.error('Error fetching users:', usersRes.error);
  if (courtStatusesRes.error) console.error('Error fetching court statuses:', courtStatusesRes.error);
  if (eventStatusesRes.error) console.error('Error fetching event statuses:', eventStatusesRes.error);
  
  let eventBookings = eventBookingsRes.data || [];

  if (eventBookings.length > 0) {
    const eventIdsWithBookings = [...new Set(eventBookings.map(b => b.event_id).filter(Boolean))];
    
    if (eventIdsWithBookings.length > 0) {
        const { data: allBookingsForEvents } = await supabase
        .from('event_bookings')
        .select('event_id, quantity')
        .in('event_id', eventIdsWithBookings)
        .eq('status', 1);

        if (allBookingsForEvents) {
            const totalsMap = allBookingsForEvents.reduce((acc, b) => {
                if (b.event_id) {
                    acc[b.event_id] = (acc[b.event_id] || 0) + (b.quantity || 1);
                }
                return acc;
            }, {} as Record<number, number>);
        
            eventBookings = eventBookings.map(booking => ({
                ...booking,
                total_enrolled: totalsMap[booking.event_id!] || 0,
            }));
        }
    }
  }

  return <BookingsClientPage
    initialCourtBookings={courtBookingsRes.data || []}
    initialEventBookings={eventBookings}
    courts={courtsRes.data || []}
    users={usersRes.data || []}
    courtBookingStatuses={courtStatusesRes.data || []}
    eventBookingStatuses={eventStatusesRes.data || []}
  />;
}
