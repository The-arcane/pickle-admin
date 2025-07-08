'use client';

import { useState, useEffect, useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Booking = {
    id: number;
    user: string;
    court: string;
    date: string;
    time: string;
    status: string;
    avatar: string | null;
    initials: string;
};

const formatTimeClient = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
        return format(new Date(dateString), 'p');
    } catch (e) {
        return 'N/A';
    }
};

export function RecentBookingsTable({ bookings }: { bookings: Booking[] }) {
    const [isClient, setIsClient] = useState(false);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        setIsClient(true);
    }, []);

    const filteredBookings = useMemo(() => {
        if (filter === 'all') {
            return bookings;
        }
        return bookings.filter(b => b.status.toLowerCase() === filter);
    }, [bookings, filter]);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div /> 
                <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead className="hidden sm:table-cell">Court</TableHead>
                        <TableHead className="hidden md:table-cell">Date</TableHead>
                        <TableHead className="hidden md:table-cell">Time</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredBookings.length > 0 ? (
                        filteredBookings.map((b) => (
                        <TableRow key={b.id}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={b.avatar ?? undefined} alt={b.user} />
                                        <AvatarFallback>{b.initials}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium">{b.user}</span>
                                </div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">{b.court}</TableCell>
                            <TableCell className="hidden md:table-cell">{b.date}</TableCell>
                            <TableCell className="hidden md:table-cell">
                                {isClient ? formatTimeClient(b.time) : <Skeleton className="h-5 w-16" />}
                            </TableCell>
                            <TableCell>
                                <StatusBadge status={b.status} />
                            </TableCell>
                        </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                No bookings match the selected filter.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
