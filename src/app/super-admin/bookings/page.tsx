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
import { format } from 'date-fns';
import { createClient } from '@/lib/supabase/client';
import type { Booking } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function BookingsPage() {
  const supabase = createClient();
  const { selectedOrgId } = useOrganization();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedOrgId) {
      setBookings([]);
      return;
    };

    const fetchBookings = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          booking_date,
          status,
          users (name),
          courts (name)
        `)
        .eq('organization_id', selectedOrgId);
      
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

  const getStatusVariant = (status: 'confirmed' | 'cancelled') => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500/20 text-green-700 border-green-500/20';
      case 'cancelled':
        return 'bg-gray-500/20 text-gray-700 border-gray-500/20';
      default:
        return 'secondary';
    }
  };

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
                  <TableCell className="font-medium">{booking.users?.name || 'N/A'}</TableCell>
                  <TableCell>{booking.courts?.name || 'N/A'}</TableCell>
                  <TableCell>{format(new Date(booking.booking_date), 'PPP p')}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusVariant(booking.status)}>
                      {booking.status}
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
