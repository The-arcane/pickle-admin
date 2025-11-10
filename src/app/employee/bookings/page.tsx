
import { EmployeeBookingsClientPage } from './client';
import { createServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function EmployeeBookingsPage() {
  const supabase = await createServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/login?type=employee');
  }

  // Get user's internal ID from their auth UUID
  const { data: userRecord, error: userRecordError } = await supabase
    .from('user')
    .select('id')
    .eq('user_uuid', user.id)
    .single();

  if (userRecordError || !userRecord) {
     return <EmployeeBookingsClientPage 
        initialCourtBookings={[]} 
        courtBookingStatuses={[]} 
        courts={[]} 
        error="Could not find your user profile. Please contact an administrator." 
    />;
  }
  
  // Get the organization ID from the join table
  const { data: orgLink } = await supabase
    .from('user_organisations')
    .select('organisation_id')
    .eq('user_id', userRecord.id)
    .maybeSingle();

  const organisationId = orgLink?.organisation_id;

  if (!organisationId) {
    return <EmployeeBookingsClientPage 
        initialCourtBookings={[]} 
        courtBookingStatuses={[]} 
        courts={[]} 
        error="You are not currently linked to any facility. Please contact your administrator." 
    />;
  }
  
  // Fetch courts for the filter dropdown
  const { data: courtsData, error: courtsError } = await supabase
    .from('courts')
    .select('id, name')
    .eq('organisation_id', organisationId)
    .order('name');
    
  const courts = courtsData || [];
  let courtBookingsData: any[] | null = [];
  let courtBookingsError: any = null;

  if (courts.length > 0) {
    const courtIds = courts.map(c => c.id);
    // Fetch bookings for the courts found in this organization.
    const { data, error } = await supabase
      .from('bookings')
      .select(
        'id, booking_status, user:user_id(name), courts:court_id(name), timeslots:timeslot_id(date, start_time, end_time)'
      )
      .in('court_id', courtIds)
      .order('id', { ascending: false });
    
    courtBookingsData = data;
    courtBookingsError = error;
  }

  // Fetch only court booking statuses for the badge
  const { data: courtBookingStatusesData, error: courtStatusesError } = await supabase.from('booking_status').select('id, label');

  if (courtBookingsError || courtStatusesError || courtsError) {
    console.error('Error fetching bookings data:', { courtBookingsError, courtStatusesError, courtsError });
  }

  const courtBookings = courtBookingsData || [];
  const courtBookingStatuses = courtBookingStatusesData || [];

  return <EmployeeBookingsClientPage
    initialCourtBookings={courtBookings}
    courtBookingStatuses={courtBookingStatuses}
    courts={courts}
  />;
}
