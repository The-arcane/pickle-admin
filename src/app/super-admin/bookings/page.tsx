
'use client';
import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/page-header';
import { useOrganization } from '@/hooks/use-organization';
import { createClient } from '@/lib/supabase/client';
import { BookingsClientPage } from './client';

export default function BookingsPage() {
  const supabase = createClient();
  const { selectedOrgId } = useOrganization();
  const [bookings, setBookings] = useState<any[]>([]);
  const [courts, setCourts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [bookingStatuses, setBookingStatuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedOrgId) {
      setBookings([]);
      setCourts([]);
      setUsers([]);
      setLoading(false);
      return;
    };

    const fetchBookingData = async () => {
      setLoading(true);

      // Fetch bookings for the selected organization
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          id, booking_status, court_id, timeslot_id, 
          user:user_id(name), 
          courts:court_id!inner(name), 
          timeslots:timeslot_id(date, start_time, end_time)
        `)
        .eq('courts.organisation_id', selectedOrgId)
        .order('id', { ascending: false });

      // Fetch all courts for the selected organization
      const { data: courtsData, error: courtsError } = await supabase
        .from('courts')
        .select('id, name')
        .eq('organisation_id', selectedOrgId);
      
      // Fetch all users associated with the selected organization
      const { data: orgUserData, error: usersError } = await supabase
        .from('user_organisations')
        .select('user!inner(id, name)')
        .eq('organisation_id', selectedOrgId)
        .not('role_id', 'is', null);

      if (bookingsError) console.error('Error fetching bookings:', bookingsError);
      if (courtsError) console.error('Error fetching courts:', courtsError);
      if (usersError) console.error('Error fetching users:', usersError);

      setBookings(bookingsData || []);
      setCourts(courtsData || []);
      setUsers(orgUserData?.map(u => u.user).filter(Boolean) || []);
      
      setLoading(false);
    };

    const fetchStatuses = async () => {
        const { data: statusData, error: statusError } = await supabase
            .from('booking_status').select('id, label');
        if (statusError) console.error('Error fetching statuses:', statusError);
        else setBookingStatuses(statusData || []);
    }

    fetchBookingData();
    fetchStatuses();
  }, [selectedOrgId, supabase]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bookings"
        description="View and manage bookings for the selected Living Space."
      />
      <BookingsClientPage 
        initialCourtBookings={bookings}
        courts={courts}
        users={users}
        courtBookingStatuses={bookingStatuses}
        loading={loading}
      />
    </div>
  );
}
