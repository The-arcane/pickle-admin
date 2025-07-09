
import { EmployeeBookingsClientPage } from './client';
import { createServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function EmployeeBookingsPage() {
  const supabase = createServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/login?type=employee');
  }

  // Get user's profile and organization link
  const { data: userProfileWithOrg } = await supabase
    .from('user')
    .select('user_organisations(organisation_id)')
    .eq('user_uuid', user.id)
    .single();
  
  const organisationId = (userProfileWithOrg?.user_organisations as any)?.[0]?.organisation_id;

  if (!organisationId) {
    console.error("Employee not linked to any organization.");
    // Render the page with an error message
    return <EmployeeBookingsClientPage 
        initialCourtBookings={[]} 
        courtBookingStatuses={[]} 
        courts={[]} 
        error="You are not currently linked to any organization. Please contact your administrator." 
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
        'id, status, user:user_id(name), courts:court_id(name), timeslots:timeslot_id(date, start_time, end_time)'
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


