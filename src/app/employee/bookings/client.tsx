
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format, parseISO, isEqual, startOfDay } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Search, X, AlertCircle } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type CourtBooking = {
  id: number;
  user: string;
  court: string;
  date: string;
  time: string;
  status: string;
  raw_date: Date | undefined;
};

type Court = {
    id: number;
    name: string;
}

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

export function EmployeeBookingsClientPage({ 
    initialCourtBookings, 
    courtBookingStatuses,
    courts,
    error
}: { 
    initialCourtBookings: any[], 
    courtBookingStatuses: any[],
    courts: Court[],
    error?: string;
}) {
    const [processedCourtBookings, setProcessedCourtBookings] = useState<CourtBooking[]>([]);
    const [isClient, setIsClient] = useState(false);
    
    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [courtFilter, setCourtFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);

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
            const date = timeslot?.date ? parseISO(timeslot.date) : undefined;
            
            return {
                id: booking.id,
                user: user?.name ?? 'N/A',
                court: court?.name ?? 'N/A',
                date: date ? format(date, 'MMM d, yyyy') : 'N/A',
                time: `${formatTime(timeslot?.start_time)} - ${formatTime(timeslot?.end_time)}`,
                status: courtStatusMap[booking.booking_status] ?? 'Unknown',
                raw_date: date,
            };
        });
        setProcessedCourtBookings(bookings);
    }, [initialCourtBookings, courtStatusMap]);

    const filteredBookings = useMemo(() => {
        return processedCourtBookings.filter(booking => {
            const searchMatch = !searchQuery || booking.user.toLowerCase().includes(searchQuery.toLowerCase());
            const courtMatch = courtFilter === 'all' || booking.court === courtFilter;
            const statusMatch = statusFilter === 'all' || booking.status.toLowerCase() === statusFilter;
            const dateMatch = !dateFilter || (booking.raw_date && isEqual(startOfDay(booking.raw_date), startOfDay(dateFilter)));
            return searchMatch && courtMatch && statusMatch && dateMatch;
        });
    }, [processedCourtBookings, searchQuery, courtFilter, statusFilter, dateFilter]);

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

        if (filteredBookings.length === 0) {
            return (
                <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
                        No court bookings found matching your criteria.
                    </TableCell>
                </TableRow>
            );
        }

        return filteredBookings.map((booking) => (
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
    }, [isClient, filteredBookings]);

    if (error) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Court Bookings</h1>
                    <p className="text-muted-foreground">View and filter all scheduled court bookings.</p>
                </div>
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Access Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Court Bookings</h1>
                <p className="text-muted-foreground">View and filter all scheduled court bookings.</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                 <div className="relative flex-grow sm:flex-grow-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search by user..." 
                        className="pl-10 w-full sm:w-64"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                <Select value={courtFilter} onValueChange={setCourtFilter} disabled={courts.length === 0}>
                    <SelectTrigger className="w-full sm:w-[180px] flex-grow sm:flex-grow-0">
                        <SelectValue placeholder="Filter by court" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Courts</SelectItem>
                        {courts.map(court => (
                             <SelectItem key={court.id} value={court.name}>{court.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                 <Select value={statusFilter} onValueChange={setStatusFilter} disabled={courtBookingStatuses.length === 0}>
                    <SelectTrigger className="w-full sm:w-[180px] flex-grow sm:flex-grow-0">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        {courtBookingStatuses.map(status => (
                            <SelectItem key={status.id} value={status.label.toLowerCase()}>{status.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <div className="flex items-center">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                            variant={"outline"}
                            className={cn(
                                "w-full sm:w-auto justify-start text-left font-normal",
                                !dateFilter && "text-muted-foreground",
                                dateFilter && "rounded-r-none"
                            )}
                            >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateFilter ? format(dateFilter, "PPP") : <span>Filter by date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                            mode="single"
                            selected={dateFilter}
                            onSelect={setDateFilter}
                            initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                    {dateFilter && (
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setDateFilter(undefined)}
                            className="h-10 w-10 p-0 border-l-0 rounded-l-none"
                        >
                        <X className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    )}
                </div>
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
