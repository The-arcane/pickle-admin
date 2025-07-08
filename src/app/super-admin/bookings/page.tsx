'use client';
import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/page-header';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useOrganization } from '@/hooks/use-organization';
import { Card } from '@/components/ui/card';
import { format, parseISO } from 'date-fns';
import { createClient } from '@/lib/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

// A more specific type for the data we fetch
type BookingWithDetails = {
  id: number;
  booking_status: { label: string } | null;
  timeslots: { date: string | null } | null;
  user: { name: string } | null;
  courts: { name: string } | null;
};


export default function BookingsPage() {
  const supabase = createClient();
  const { selectedOrgId } = useOrganization();
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedOrgId) {
      setBookings([]);
      setLoading(false);
      return;
    };

    const fetchBookings = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          booking_status ( label ),
          timeslots ( date ),
          user:user_id ( name ),
          courts:court_id!inner ( name )
        `)
        .eq('courts.organisation_id', selectedOrgId)
        .order('id', { ascending: false });
      
      if (error) {
        console.error('Error fetching bookings:', error);
        setBookings([]);
      } else {
        setBookings(data as any[]);
      }
      setLoading(false);
    };

    fetchBookings();
  }, [selectedOrgId, supabase]);

  const getStatusVariant = (status: string | undefined) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-green-500/20 text-green-700 border-green-500/20';
      case 'Cancelled':
        return 'bg-red-500/20 text-red-700 border-red-500/20';
       case 'Pending':
        return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/20';
      default:
        return 'secondary';
    }
  };
  
  const bookingDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "N/A";
    return format(parseISO(dateStr), 'PPP');
  }

  return (
    <>
      <PageHeader
        title="Bookings"
        description="View all bookings for the selected organization."
      />
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Court</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
             {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                </TableRow>
              ))
            ) : bookings.length > 0 ? (
              bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">{booking.user?.name || 'N/A'}</TableCell>
                  <TableCell>{booking.courts?.name || 'N/A'}</TableCell>
                  <TableCell>{bookingDate(booking.timeslots?.date)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusVariant(booking.booking_status?.label)}>
                      {booking.booking_status?.label || 'N/A'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No bookings found for this organization.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
