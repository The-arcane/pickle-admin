'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format, parseISO } from 'date-fns';

type CourtBooking = {
  id: number;
  user: string;
  court: string;
  date: string;
  time: string;
  status: string;
};

const formatTime = (timeString: string | null) => {
    if (!timeString) return '';
    try {
        const date = new Date(timeString);
        if (isNaN(date.getTime())) {
            console.error(`Failed to parse time: Invalid date from string "${timeString}"`);
            return "Invalid Time";
        }
        return format(date, 'p');
    } catch (e) {
        console.error(`Error formatting time: ${timeString}`, e);
        return "Invalid Time";
    }
}

export function EmployeeBookingsClientPage({ initialCourtBookings, courtBookingStatuses }: { initialCourtBookings: any[], courtBookingStatuses: any[] }) {
    const [processedCourtBookings, setProcessedCourtBookings] = useState<CourtBooking[]>([]);
    const [isClient, setIsClient] = useState(false);

    const courtStatusMap = useMemo(() => {
        return courtBookingStatuses.reduce((acc, status) => {
            acc[status.id] = status.label;
            return acc;
        }, {} as { [key: number]: string });
    }, [courtBookingStatuses]);
    
    useEffect(() => {
        setIsClient(true);
        const bookings = initialCourtBookings.map((booking) => {
            const user = booking.user;
            const court = booking.courts;
            const timeslot = booking.timeslots;
            const date = timeslot?.date ? parseISO(timeslot.date) : new Date();
            
            return {
                id: booking.id,
                user: user?.name ?? 'N/A',
                court: court?.name ?? 'N/A',
                date: timeslot?.date ? format(date, 'MMM d, yyyy') : 'N/A',
                time: `${formatTime(timeslot?.start_time)} - ${formatTime(timeslot?.end_time)}`,
                status: courtStatusMap[booking.status] ?? 'Unknown',
            };
        });
        setProcessedCourtBookings(bookings);
    }, [initialCourtBookings, courtStatusMap]);

    const memoizedCourtBookings = useMemo(() => {
        if (!isClient) {
            return Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={`skeleton-court-${index}`}>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                </TableRow>
            ));
        }

        if (processedCourtBookings.length === 0) {
            return (
                <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No court bookings found.
                    </TableCell>
                </TableRow>
            );
        }

        return processedCourtBookings.map((booking) => (
            <TableRow key={booking.id}>
                <TableCell className="font-medium">{booking.user}</TableCell>
                <TableCell>{booking.court}</TableCell>
                <TableCell>{booking.date}</TableCell>
                <TableCell>{booking.time}</TableCell>
                <TableCell>
                    <StatusBadge status={booking.status} />
                </TableCell>
            </TableRow>
        ));
    }, [isClient, processedCourtBookings]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Court Bookings</h1>
                <p className="text-muted-foreground">View all scheduled court bookings.</p>
            </div>
            <Card>
                <CardContent className="pt-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Court</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Time</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {memoizedCourtBookings}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
