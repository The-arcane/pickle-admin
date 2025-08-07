
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/status-badge';
import { Calendar as CalendarIcon, Pencil, Search, X, Calendar } from 'lucide-react';
import { addBooking, updateBooking, getTimeslots } from './actions';
import { useToast } from "@/hooks/use-toast";
import { format, parseISO, formatISO, isEqual, startOfDay } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from 'next/link';
import { Input } from '@/components/ui/input';

// Types for Court Bookings
type CourtBookingFromDb = {
  id: number;
  booking_status: number;
  court_id: number;
  timeslot_id: number;
  user: { name: string } | null;
  courts: { name: string } | null;
  timeslots: { date: string | null; start_time: string | null, end_time: string | null } | null;
};

type ProcessedCourtBooking = {
  id: number;
  user: string;
  court: string;
  date: string;
  time: string;
  status: string;
  court_id: number;
  timeslot_id: number;
  raw_date: Date | undefined;
};

// Types for Event Bookings
type EventBookingFromDb = {
    id: number;
    booking_time: string | null;
    quantity: number | null;
    status: number;
    user: { name: string; } | null;
    events: { title: string; } | null;
    total_enrolled: number;
};

type ProcessedEventBooking = {
    id: number;
    user: string;
    event: string;
    quantity: number;
    date: string;
    status: string;
    total_enrolled: number;
};

type Court = {
    id: number;
    name: string;
}

type User = {
    id: number;
    name: string;
}

type Timeslot = {
    id: number;
    start_time: string | null;
    end_time: string | null;
}

type BookingStatus = {
    id: number;
    label: string;
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

export function BookingsClientPage({ 
    initialCourtBookings, 
    initialEventBookings,
    courts: allCourts, 
    users: allUsers, 
    courtBookingStatuses,
    eventBookingStatuses
}: { 
    initialCourtBookings: CourtBookingFromDb[], 
    initialEventBookings: EventBookingFromDb[],
    courts: Court[], 
    users: User[], 
    courtBookingStatuses: BookingStatus[],
    eventBookingStatuses: BookingStatus[],
}) {
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<ProcessedCourtBooking | null>(null);
    const { toast } = useToast();
    
    const [processedCourtBookings, setProcessedCourtBookings] = useState<ProcessedCourtBooking[]>([]);
    const [processedEventBookings, setProcessedEventBookings] = useState<ProcessedEventBooking[]>([]);
    const [isClient, setIsClient] = useState(false);
    const [activeTab, setActiveTab] = useState('courts');

    // Filter states
    const [courtUserSearch, setCourtUserSearch] = useState('');
    const [courtIdFilter, setCourtIdFilter] = useState('all');
    const [courtStatusFilter, setCourtStatusFilter] = useState('all');
    const [courtDateFilter, setCourtDateFilter] = useState<Date | undefined>(undefined);

    const [eventSearch, setEventSearch] = useState('');
    const [eventStatusFilter, setEventStatusFilter] = useState('all');

    // Court Booking Status Map
    const courtStatusMap = useMemo(() => {
        return courtBookingStatuses.reduce((acc, status) => {
            acc[status.id] = status.label;
            return acc;
        }, {} as { [key: number]: string });
    }, [courtBookingStatuses]);

    // Event Booking Status Map
    const eventStatusMap = useMemo(() => {
        return eventBookingStatuses.reduce((acc, status) => {
            acc[status.id] = status.label;
            return acc;
        }, {} as { [key: number]: string });
    }, [eventBookingStatuses]);

    // Process Court Bookings
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
                status: courtStatusMap[booking.booking_status] ?? 'Unknown',
                court_id: booking.court_id,
                timeslot_id: booking.timeslot_id,
                raw_date: timeslot?.date ? date : undefined
            };
        });
        setProcessedCourtBookings(bookings);
    }, [initialCourtBookings, courtStatusMap]);

    // Process Event Bookings
    useEffect(() => {
        const bookings = initialEventBookings.map((booking) => ({
            id: booking.id,
            user: booking.user?.name ?? 'N/A',
            event: booking.events?.title ?? 'N/A',
            quantity: booking.quantity ?? 1,
            date: booking.booking_time ? format(parseISO(booking.booking_time), 'MMM d, yyyy') : 'N/A',
            status: eventStatusMap[booking.status] ?? 'Unknown',
            total_enrolled: booking.total_enrolled,
        }));
        setProcessedEventBookings(bookings);
    }, [initialEventBookings, eventStatusMap]);

    const filteredCourtBookings = useMemo(() => {
        return processedCourtBookings.filter(booking => {
            const userMatch = !courtUserSearch || booking.user.toLowerCase().includes(courtUserSearch.toLowerCase());
            const courtMatch = courtIdFilter === 'all' || booking.court_id.toString() === courtIdFilter;
            const statusMatch = courtStatusFilter === 'all' || booking.status === courtStatusFilter;
            const dateMatch = !courtDateFilter || (booking.raw_date && isEqual(startOfDay(booking.raw_date), startOfDay(courtDateFilter)));
            return userMatch && courtMatch && statusMatch && dateMatch;
        });
    }, [processedCourtBookings, courtUserSearch, courtIdFilter, courtStatusFilter, courtDateFilter]);

    const filteredEventBookings = useMemo(() => {
        return processedEventBookings.filter(booking => {
            const searchMatch = !eventSearch || 
                                booking.user.toLowerCase().includes(eventSearch.toLowerCase()) || 
                                booking.event.toLowerCase().includes(eventSearch.toLowerCase());
            const statusMatch = eventStatusFilter === 'all' || booking.status === eventStatusFilter;
            return searchMatch && statusMatch;
        });
    }, [processedEventBookings, eventSearch, eventStatusFilter]);


    // State for Edit Dialog
    const [selectedCourtId, setSelectedCourtId] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [availableTimeslots, setAvailableTimeslots] = useState<Timeslot[]>([]);
    const [isLoadingTimeslots, setIsLoadingTimeslots] = useState(false);
    const [selectedTimeslotId, setSelectedTimeslotId] = useState<string>('');

    // State for Add Dialog
    const [addCourtId, setAddCourtId] = useState<string>('');
    const [addDate, setAddDate] = useState<Date | undefined>(undefined);
    const [addAvailableTimeslots, setAddAvailableTimeslots] = useState<Timeslot[]>([]);
    const [isAddLoadingTimeslots, setIsAddLoadingTimeslots] = useState(false);

    // Effect for Edit Dialog Timeslots
    useEffect(() => {
        if (selectedCourtId && selectedDate && isEditDialogOpen) {
            setIsLoadingTimeslots(true);
            const dateString = formatISO(selectedDate, { representation: 'date' });
            getTimeslots(Number(selectedCourtId), dateString, selectedBooking?.id)
                .then((slots) => {
                    setAvailableTimeslots(slots);
                    if (!slots.some(slot => slot.id.toString() === selectedTimeslotId)) {
                        setSelectedTimeslotId('');
                    }
                })
                .finally(() => setIsLoadingTimeslots(false));
        } else {
            setAvailableTimeslots([]);
        }
    }, [selectedCourtId, selectedDate, isEditDialogOpen, selectedTimeslotId, selectedBooking]);

    // Effect for Add Dialog Timeslots
    useEffect(() => {
        if (addCourtId && addDate && isAddDialogOpen) {
            setIsAddLoadingTimeslots(true);
            const dateString = formatISO(addDate, { representation: 'date' });
            getTimeslots(Number(addCourtId), dateString)
                .then(setAddAvailableTimeslots)
                .finally(() => setIsAddLoadingTimeslots(false));
        } else {
            setAddAvailableTimeslots([]);
        }
    }, [addCourtId, addDate, isAddDialogOpen]);


    const handleEditClick = (booking: ProcessedCourtBooking) => {
        setSelectedBooking(booking);
        setSelectedCourtId(booking.court_id.toString());
        setSelectedDate(booking.raw_date);
        setSelectedTimeslotId(booking.timeslot_id.toString());
        setIsEditDialogOpen(true);
    };
    
    const handleUpdateFormAction = async (formData: FormData) => {
        const result = await updateBooking(formData);
        if (result.error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: result.error,
            });
        } else {
            toast({
                title: "Success",
                description: "Booking updated successfully.",
            });
            setIsEditDialogOpen(false);
            setSelectedBooking(null);
        }
    }
    
    const handleAddFormAction = async (formData: FormData) => {
        if (addDate) {
            formData.append('date', formatISO(addDate, { representation: 'date' }));
        }
        const result = await addBooking(formData);
        if (result.error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: result.error,
            });
        } else {
            toast({
                title: "Success",
                description: "Booking added successfully.",
            });
            setIsAddDialogOpen(false);
        }
    }

    const memoizedCourtBookings = useMemo(() => {
        if (!isClient) {
            return Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={`skeleton-court-${index}`}>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
            ));
        }

        if (filteredCourtBookings.length === 0) {
            return (
                <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground h-24">
                        No court bookings found matching your criteria.
                    </TableCell>
                </TableRow>
            );
        }

        return filteredCourtBookings.map((booking) => (
            <TableRow key={booking.id}>
                <TableCell className="font-medium">{booking.user}</TableCell>
                <TableCell>{booking.court}</TableCell>
                <TableCell>{booking.date}</TableCell>
                <TableCell>{booking.time}</TableCell>
                <TableCell>
                    <StatusBadge status={booking.status} />
                </TableCell>
                <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEditClick(booking)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit booking</span>
                    </Button>
                </TableCell>
            </TableRow>
        ));
    }, [isClient, filteredCourtBookings]);

    const memoizedEventBookings = useMemo(() => {
        if (!isClient) {
            return Array.from({ length: 3 }).map((_, index) => (
                <TableRow key={`skeleton-event-${index}`}>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                </TableRow>
            ));
        }

        if (filteredEventBookings.length === 0) {
            return (
                <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground h-24">
                        No event bookings found matching your criteria.
                    </TableCell>
                </TableRow>
            );
        }

        return filteredEventBookings.map((booking) => (
            <TableRow key={booking.id}>
                <TableCell className="font-medium">{booking.event}</TableCell>
                <TableCell>{booking.user}</TableCell>
                <TableCell>{booking.quantity}</TableCell>
                <TableCell>{booking.total_enrolled}</TableCell>
                <TableCell>{booking.date}</TableCell>
                <TableCell>
                    <StatusBadge status={booking.status} />
                </TableCell>
            </TableRow>
        ));
    }, [isClient, filteredEventBookings]);

  return (
    <>
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Calendar className="h-8 w-8 text-green-500" />
                    <div>
                        <h1 className="text-3xl font-bold">Bookings</h1>
                        <p className="text-muted-foreground">Manage court and event bookings.</p>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="courts" onValueChange={setActiveTab} className="space-y-4">
                <div className="flex justify-between items-center">
                    <TabsList>
                        <TabsTrigger value="courts">Court Bookings</TabsTrigger>
                        <TabsTrigger value="events">Event Bookings</TabsTrigger>
                    </TabsList>
                    <div>
                        {activeTab === 'courts' && (
                            <Button onClick={() => setIsAddDialogOpen(true)}>+ Add Court Booking</Button>
                        )}
                        {activeTab === 'events' && (
                             <Button asChild>
                                <Link href="/dashboard/events/add">+ Add Event Booking</Link>
                            </Button>
                        )}
                    </div>
                </div>
                <TabsContent value="courts">
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                        <div className="relative flex-grow sm:flex-grow-0">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search by user..." className="pl-10 w-full sm:w-48" value={courtUserSearch} onChange={e => setCourtUserSearch(e.target.value)} />
                        </div>
                        <Select value={courtIdFilter} onValueChange={setCourtIdFilter}>
                            <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Filter by court" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Courts</SelectItem>
                                {allCourts.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={courtStatusFilter} onValueChange={setCourtStatusFilter}>
                            <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Filter by status" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                {courtBookingStatuses.map(s => <SelectItem key={s.id} value={s.label}>{s.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <div className="flex items-center">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant={"outline"} className={cn("w-[240px] justify-start text-left font-normal", !courtDateFilter && "text-muted-foreground", courtDateFilter && "rounded-r-none")}>
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {courtDateFilter ? format(courtDateFilter, "PPP") : <span>Filter by date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={courtDateFilter} onSelect={setCourtDateFilter} /></PopoverContent>
                            </Popover>
                            {courtDateFilter && (
                                <Button variant="outline" size="icon" onClick={() => setCourtDateFilter(undefined)} className="h-10 w-10 p-0 border-l-0 rounded-l-none">
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
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                                {memoizedCourtBookings}
                            </TableBody>
                        </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="events">
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                        <div className="relative flex-grow sm:flex-grow-0">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search by event or user..." className="pl-10 w-full sm:w-64" value={eventSearch} onChange={e => setEventSearch(e.target.value)} />
                        </div>
                        <Select value={eventStatusFilter} onValueChange={setEventStatusFilter}>
                            <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Filter by status" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                {eventBookingStatuses.map(s => <SelectItem key={s.id} value={s.label}>{s.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <Card>
                        <CardContent className="pt-6">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Event</TableHead>
                                        <TableHead>User</TableHead>
                                        <TableHead>Attendees</TableHead>
                                        <TableHead>Total Attendees (Event)</TableHead>
                                        <TableHead>Booking Date</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {memoizedEventBookings}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

        </div>

        {/* Edit Court Booking Dialog */}
        {selectedBooking && (
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Court Booking</DialogTitle>
                </DialogHeader>
                <form action={handleUpdateFormAction}>
                    <input type="hidden" name="id" value={selectedBooking.id} />
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="court_id">Court</Label>
                            <Select name="court_id" value={selectedCourtId} onValueChange={setSelectedCourtId}>
                                <SelectTrigger id="court_id">
                                    <SelectValue placeholder="Select court" />
                                </SelectTrigger>
                                <SelectContent>
                                    {allCourts.map((court) => (
                                        <SelectItem key={court.id} value={court.id.toString()}>{court.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                             <Label htmlFor="date">Date</Label>
                             <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !selectedDate && "text-muted-foreground"
                                    )}
                                    >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={setSelectedDate}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="timeslot_id">Timeslot</Label>
                            <Select name="timeslot_id" value={selectedTimeslotId} onValueChange={setSelectedTimeslotId} disabled={isLoadingTimeslots || !selectedDate}>
                                <SelectTrigger id="timeslot_id">
                                    <SelectValue placeholder={isLoadingTimeslots ? "Loading..." : "Select timeslot"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableTimeslots.length > 0 ? (
                                        availableTimeslots.map((slot) => (
                                            <SelectItem key={slot.id} value={slot.id.toString()}>{formatTime(slot.start_time)} - {formatTime(slot.end_time)}</SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem value="none" disabled>
                                            {selectedDate ? 'No available slots' : 'Please select a date'}
                                        </SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select name="status" defaultValue={selectedBooking.status}>
                                <SelectTrigger id="status">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {courtBookingStatuses.map((status) => (
                                        <SelectItem key={status.id} value={status.label}>{status.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit">Save Changes</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
            </Dialog>
        )}

        {/* Add Court Booking Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Court Booking</DialogTitle>
                </DialogHeader>
                <form action={handleAddFormAction}>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="add_user_id">User</Label>
                            <Select name="user_id">
                                <SelectTrigger id="add_user_id">
                                    <SelectValue placeholder="Select user" />
                                </SelectTrigger>
                                <SelectContent>
                                    {allUsers.map((user) => (
                                        <SelectItem key={user.id} value={user.id.toString()}>{user.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="add_court_id">Court</Label>
                            <Select name="court_id" onValueChange={setAddCourtId}>
                                <SelectTrigger id="add_court_id">
                                    <SelectValue placeholder="Select court" />
                                </SelectTrigger>
                                <SelectContent>
                                    {allCourts.map((court) => (
                                        <SelectItem key={court.id} value={court.id.toString()}>{court.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                             <Label htmlFor="add_date">Date</Label>
                             <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !addDate && "text-muted-foreground"
                                    )}
                                    >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {addDate ? format(addDate, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                    mode="single"
                                    selected={addDate}
                                    onSelect={setAddDate}
                                    disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="add_timeslot_id">Timeslot</Label>
                            <Select name="timeslot_id" disabled={isAddLoadingTimeslots || !addDate || !addCourtId}>
                                <SelectTrigger id="add_timeslot_id">
                                    <SelectValue placeholder={isAddLoadingTimeslots ? "Loading..." : "Select timeslot"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {addAvailableTimeslots.length > 0 ? (
                                        addAvailableTimeslots.map((slot) => (
                                            <SelectItem key={slot.id} value={slot.id.toString()}>{formatTime(slot.start_time)} - {formatTime(slot.end_time)}</SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem value="none" disabled>
                                            {!addCourtId || !addDate ? 'Select court and date' : 'No available slots'}
                                        </SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="add_status">Status</Label>
                            <Select name="status" defaultValue="Pending">
                                <SelectTrigger id="add_status">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                     {courtBookingStatuses.map((status) => (
                                        <SelectItem key={status.id} value={status.label}>{status.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit">Add Booking</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
            </Dialog>
    </>
  );
}
