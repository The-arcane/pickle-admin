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
import type { Event } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function EventsPage() {
  const supabase = createClient();
  const { selectedOrgId } = useOrganization();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedOrgId) {
      setEvents([]);
      return;
    };

    const fetchEvents = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('organization_id', selectedOrgId);
      
      if (error) {
        console.error('Error fetching events:', error);
        setEvents([]);
      } else {
        setEvents(data as Event[]);
      }
      setLoading(false);
    };

    fetchEvents();
  }, [selectedOrgId, supabase]);

  const getStatusVariant = (status: 'upcoming' | 'completed' | 'cancelled') => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-500/20 text-blue-700 border-blue-500/20';
      case 'completed':
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
        title="Events"
        description="View all events for the selected organization."
      />
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
             {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                </TableRow>
              ))
            ) : events.length > 0 ? (
              events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">{event.name}</TableCell>
                  <TableCell>{format(new Date(event.date), 'PPP')}</TableCell>
                  <TableCell>{`${event.start_time} - ${event.end_time}`}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusVariant(event.status)}>
                      {event.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No events found for this organization.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
