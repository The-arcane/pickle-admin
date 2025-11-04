

'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/status-badge';
import { Calendar as CalendarIcon, Pencil, Search, X, PartyPopper, Info, Trash2 } from 'lucide-react';
import { addBooking, updateBooking, getTimeslots, cancelBooking, updateEventBookingStatus } from './actions';
import { cancelEventBooking } from '../events/actions';
import { useToast } from "@/hooks/use-toast";
import { format, parseISO, formatISO, isEqual, startOfDay, addDays } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { usePathname } from 'next/navigation';


// Types
type CourtBookingFromDb = {
  id: number; booking_status: number; court_id: number; timeslot_id: number;
  user: { name: string, id: number } | null;
  courts: { name: string } | null;
  timeslots: { date: string | null; start_time: string | null, end_time: string | null } | null;
};
type ProcessedCourtBooking = {
  id: number; user: string; court: string; date: string; time: string; status: string;
  user_id: number; court_id: number; timeslot_id: number; raw_date: Date | undefined;
};
type EventBookingFromDb = {
    id: number; booking_time: string | null; quantity: number | null; status: number;
    user: { name: string; } | null;
    events: { title: string; } | null;
    total_enrolled: number;
};
type ProcessedEventBooking = {
    id: number; user: string; event: string; quantity: number; date: string; status: string; total_enrolled: number;
};
type Court = { 
    id: number; 
    name: string;
    booking_window: number;
    one_booking_per_user_per_day: boolean;
    is_booking_rolling: boolean;
};
type User = { id: number; name: string; };
type Timeslot = { id: string; startTime: string; endTime: string; isDisable: boolean; reasonDesc: string; color: string; };
type BookingStatus = { id: number; label: string; };

const formatTime = (timeString: string | null) => {
    if (!timeString) return '';
    try {
        const date = new Date(timeString);
        return isNaN(date.getTime()) ? "Invalid Time" : format(date, 'p');
    } catch (e) {
        return "Invalid Time";
    }
}

export function BookingsClientPage({ 
    initialCourtBookings, initialEventBookings, courts: allCourts, users: allUsers, 
    courtBookingStatuses, eventBookingStatuses
}: { 
    initialCourtBookings: CourtBookingFromDb[], initialEventBookings: EventBookingFromDb[],
    courts: Court[], users: User[], courtBookingStatuses: BookingStatus[], eventBookingStatuses: BookingStatus[],
}) {
    const pathname = usePathname();
    const [isClient, setIsClient] = useState(false);
    useEffect(() => setIsClient(true), []);
    
    const basePath = pathname.startsWith('/arena') ? '/arena' : '/livingspace';


    // Tabs
    const [activeTab, setActiveTab] = useState('courts');

    // Dialogs
    const [isCourtEditDialogOpen, setIsCourtEditDialogOpen] = useState(false);
    const [isEventEditDialogOpen, setIsEventEditDialogOpen] = useState(false);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
    const [bookingToCancel, setBookingToCancel] = useState<{id: number, type: 'court' | 'event', user: string, item: string} | null>(null);
    
    // Toasts
    const { toast } = useToast();
    
    // Data processing
    const courtStatusMap = useMemo(() => Object.fromEntries(courtBookingStatuses.map(s => [s.id, s.label])), [courtBookingStatuses]);
    const eventStatusMap = useMemo(() => Object.fromEntries(eventBookingStatuses.map(s => [s.id, s.label])), [eventBookingStatuses]);
    const eventStatusMapReverse = useMemo(() => Object.fromEntries(eventBookingStatuses.map(s => [s.label, s.id])), [eventBookingStatuses]);

    const processedCourtBookings = useMemo(() => initialCourtBookings.map(b => {
        const date = b.timeslots?.date ? parseISO(b.timeslots.date) : undefined;
        return {
            id: b.id, user: b.user?.name ?? 'N/A', court: b.courts?.name ?? 'N/A',
            date: date ? format(date, 'MMM d, yyyy') : 'N/A',
            time: `${formatTime(b.timeslots?.start_time)} - ${formatTime(b.timeslots?.end_time)}`,
            status: courtStatusMap[b.booking_status] ?? 'Unknown',
            court_id: b.court_id, timeslot_id: b.timeslot_id, raw_date: date, user_id: b.user?.id ?? 0
        };
    }), [initialCourtBookings, courtStatusMap]);
    
    const processedEventBookings = useMemo(() => initialEventBookings.map(b => ({
        id: b.id, user: b.user?.name ?? 'N/A', event: b.events?.title ?? 'N/A',
        quantity: b.quantity ?? 1,
        date: b.booking_time ? format(parseISO(b.booking_time), 'MMM d, yyyy') : 'N/A',
        status: eventStatusMap[b.status] ?? 'Unknown',
        total_enrolled: b.total_enrolled,
    })), [initialEventBookings, eventStatusMap]);

    // Filters
    const [courtUserSearch, setCourtUserSearch] = useState('');
    const [courtIdFilter, setCourtIdFilter] = useState('all');
    const [courtStatusFilter, setCourtStatusFilter] = useState('all');
    const [courtDateFilter, setCourtDateFilter] = useState<Date | undefined>(undefined);
    const [eventSearch, setEventSearch] = useState('');
    const [eventStatusFilter, setEventStatusFilter] = useState('all');

    const filteredCourtBookings = useMemo(() => processedCourtBookings.filter(b => 
        (!courtUserSearch || b.user.toLowerCase().includes(courtUserSearch.toLowerCase())) &&
        (courtIdFilter === 'all' || b.court_id.toString() === courtIdFilter) &&
        (courtStatusFilter === 'all' || b.status === courtStatusFilter) &&
        (!courtDateFilter || (b.raw_date && isEqual(startOfDay(b.raw_date), startOfDay(courtDateFilter))))
    ), [processedCourtBookings, courtUserSearch, courtIdFilter, courtStatusFilter, courtDateFilter]);

    const filteredEventBookings = useMemo(() => processedEventBookings.filter(b => 
        (!eventSearch || b.user.toLowerCase().includes(eventSearch.toLowerCase()) || b.event.toLowerCase().includes(eventSearch.toLowerCase())) &&
        (eventStatusFilter === 'all' || b.status === eventStatusFilter)
    ), [processedEventBookings, eventSearch, eventStatusFilter]);

    // Dialog state
    const [selectedCourtBooking, setSelectedCourtBooking] = useState<ProcessedCourtBooking | null>(null);
    const [selectedEventBooking, setSelectedEventBooking] = useState<ProcessedEventBooking | null>(null);
    const [editCourtId, setEditCourtId] = useState<string>('');
    const [editDate, setEditDate] = useState<string>('');
    const [editTimeslot, setEditTimeslot] = useState<Timeslot | null>(null);
    const [editAvailableSlots, setEditAvailableSlots] = useState<Timeslot[]>([]);
    const [isEditLoadingSlots, setIsEditLoadingSlots] = useState(false);
    const [editCourtRules, setEditCourtRules] = useState<Partial<Court> | null>(null);

    const [addUserId, setAddUserId] = useState<string>('');
    const [addCourtId, setAddCourtId] = useState<string>('');
    const [addDate, setAddDate] = useState<Date | undefined>(new Date());
    const [addSelectedTimeSlot, setAddSelectedTimeSlot] = useState<Timeslot | null>(null);
    const [addAvailableSlots, setAddAvailableSlots] = useState<Timeslot[]>([]);
    const [isAddLoadingSlots, setIsAddLoadingSlots] = useState(false);
    const [addCourtRules, setAddCourtRules] = useState<Partial<Court> | null>(null);
    
    // Fetch available timeslots for Edit Dialog
    useEffect(() => {
        if (editCourtId && editDate && isCourtEditDialogOpen && selectedCourtBooking) {
            setIsEditLoadingSlots(true);
            setEditCourtRules(allCourts.find(c => c.id.toString() === editCourtId) ?? null);
            getTimeslots(Number(editCourtId), editDate, selectedCourtBooking.user_id, selectedCourtBooking.id)
                .then(slots => {
                    setEditAvailableSlots(slots);
                    if (!slots.some(s => s.id === editTimeslot?.id)) {
                        setEditTimeslot(null);
                    }
                })
                .finally(() => setIsEditLoadingSlots(false));
        }
    }, [editCourtId, editDate, isCourtEditDialogOpen, selectedCourtBooking, allCourts, editTimeslot]);


    // Fetch available timeslots for Add Dialog
    useEffect(() => {
        if (addCourtId && addDate && addUserId) {
            setIsAddLoadingSlots(true);
            setAddAvailableSlots([]); // Clear old slots
            setAddSelectedTimeSlot(null);
            setAddCourtRules(allCourts.find(c => c.id.toString() === addCourtId) ?? null);
            getTimeslots(Number(addCourtId), formatISO(addDate, { representation: 'date'}), Number(addUserId))
                .then(setAddAvailableSlots)
                .finally(() => setIsAddLoadingSlots(false));
        } else {
            setAddCourtRules(null);
        }
    }, [addCourtId, addDate, addUserId, allCourts]);

    const handleCourtEditClick = (booking: ProcessedCourtBooking) => {
        setSelectedCourtBooking(booking);
        setEditCourtId(booking.court_id.toString());
        setEditDate(booking.raw_date ? format(booking.raw_date, 'yyyy-MM-dd') : '');
        setEditTimeslot(null); // Will be set from available slots
        setIsCourtEditDialogOpen(true);
    };

    const handleEventEditClick = (booking: ProcessedEventBooking) => {
        setSelectedEventBooking(booking);
        setIsEventEditDialogOpen(true);
    };

    const handleCancelClick = (booking: ProcessedCourtBooking | ProcessedEventBooking) => {
        const type = 'court' in booking ? 'court' : 'event';
        setBookingToCancel({
            id: booking.id,
            type: type,
            user: booking.user,
            item: type === 'court' ? (booking as ProcessedCourtBooking).court : (booking as ProcessedEventBooking).event,
        });
        setIsCancelDialogOpen(true);
    };

    const handleConfirmCancel = async () => {
        if (!bookingToCancel) return;
        
        const formData = new FormData();
        formData.append('id', bookingToCancel.id.toString());

        const action = bookingToCancel.type === 'court' ? cancelBooking : cancelEventBooking;
        const result = await action(formData);
        
        if (result.error) {
            toast({ variant: "destructive", title: "Error", description: result.error });
        } else {
            toast({ title: "Success", description: result.message });
        }
        setIsCancelDialogOpen(false);
        setBookingToCancel(null);
    };

    const handleAddDialogChange = (open: boolean) => {
        if (!open) {
            // Reset form state when dialog closes
            setAddUserId('');
            setAddCourtId('');
            setAddDate(new Date());
            setAddAvailableSlots([]);
            setAddCourtRules(null);
            setAddSelectedTimeSlot(null);
        }
        setIsAddDialogOpen(open);
    }

    const handleFormSubmit = useCallback(async (action: Promise<any>, successMsg: string, errorTitle: string) => {
        const result = await action;
        if (result.error) {
            toast({ variant: "destructive", title: errorTitle, description: result.error });
        } else {
            toast({ title: "Success", description: successMsg });
            setIsAddDialogOpen(false);
            setIsCourtEditDialogOpen(false);
            setIsEventEditDialogOpen(false);
        }
    }, [toast]);
    
    const bookingWindow = addCourtRules?.booking_window || 7;
    const maxBookableDate = addDays(new Date(), bookingWindow - 1);

    return (
        <>
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <CalendarIcon className="h-8 w-8 text-primary" />
                    <div>
                        <h1 className="text-3xl font-bold">Bookings</h1>
                        <p className="text-muted-foreground">Manage court and event bookings.</p>
                    </div>
                </div>
                 <div className="w-full sm:w-auto">
                    {activeTab === 'courts' && <Button className="w-full" onClick={() => setIsAddDialogOpen(true)}>+ Add Court Booking</Button>}
                    {activeTab === 'events' && <Button className="w-full" asChild><Link href={`${basePath}/events/add`}>+ Add Event Booking</Link></Button>}
                </div>
            </header>

            <Tabs defaultValue="courts" onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="courts">
                        <CalendarIcon className="mr-2 h-4 w-4"/>
                        Court Bookings
                    </TabsTrigger>
                    <TabsTrigger value="events">
                        <PartyPopper className="mr-2 h-4 w-4"/>
                        Event Bookings
                    </TabsTrigger>
                </TabsList>
                
                <TabsContent value="courts" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>All Court Bookings</CardTitle>
                            <CardDescription>Filter and manage all court reservations.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-col md:flex-row gap-2">
                                <div className="relative flex-grow">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Search by user name..." className="pl-10 w-full" value={courtUserSearch} onChange={e => setCourtUserSearch(e.target.value)} />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 md:flex gap-2">
                                    <Select value={courtIdFilter} onValueChange={setCourtIdFilter}>
                                        <SelectTrigger className="w-full"><SelectValue placeholder="Filter by court" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Courts</SelectItem>
                                            {allCourts.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <Select value={courtStatusFilter} onValueChange={setCourtStatusFilter}>
                                        <SelectTrigger className="w-full"><SelectValue placeholder="Filter by status" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Statuses</SelectItem>
                                            {courtBookingStatuses.map(s => <SelectItem key={s.id} value={s.label}>{s.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <div className="flex items-center">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !courtDateFilter && "text-muted-foreground", courtDateFilter && "rounded-r-none")}>
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {courtDateFilter ? format(courtDateFilter, "PPP") : <span>Filter by date</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={courtDateFilter} onSelect={setCourtDateFilter} /></PopoverContent>
                                        </Popover>
                                        {courtDateFilter && <Button variant="outline" size="icon" className="h-10 w-10 p-0 border-l-0 rounded-l-none" onClick={() => setCourtDateFilter(undefined)}><X className="h-4 w-4" /></Button>}
                                    </div>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader><TableRow>
                                        <TableHead>User</TableHead><TableHead>Court</TableHead><TableHead>Date</TableHead>
                                        <TableHead>Time</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead>
                                    </TableRow></TableHeader>
                                    <TableBody>
                                        {!isClient ? Array.from({ length: 5 }).map((_, i) => (
                                            <TableRow key={`skel-court-${i}`}>
                                                <TableCell><Skeleton className="h-5 w-24" /></TableCell><TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                                <TableCell><Skeleton className="h-5 w-24" /></TableCell><TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                                <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell><TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                            </TableRow>
                                        )) : filteredCourtBookings.length === 0 ? (
                                            <TableRow><TableCell colSpan={6} className="text-center h-24">No court bookings found.</TableCell></TableRow>
                                        ) : (
                                            filteredCourtBookings.map(b => (
                                                <TableRow key={b.id}>
                                                    <TableCell className="font-medium">{b.user}</TableCell><TableCell>{b.court}</TableCell><TableCell>{b.date}</TableCell>
                                                    <TableCell>{b.time}</TableCell><TableCell><StatusBadge status={b.status} /></TableCell>
                                                    <TableCell className="text-right">
                                                         <DropdownMenu>
                                                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem onSelect={() => handleCourtEditClick(b)}><Pencil className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem onSelect={() => handleCancelClick(b)} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" />Cancel</DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                
                <TabsContent value="events" className="mt-6">
                     <Card>
                        <CardHeader>
                            <CardTitle>All Event Bookings</CardTitle>
                            <CardDescription>Filter and manage all event and activity enrollments.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-col md:flex-row gap-2">
                                <div className="relative flex-grow">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Search event or user..." className="pl-10 w-full" value={eventSearch} onChange={e => setEventSearch(e.target.value)} />
                                </div>
                                <Select value={eventStatusFilter} onValueChange={setEventStatusFilter}>
                                    <SelectTrigger className="w-full md:w-48"><SelectValue placeholder="Filter by status" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        {eventBookingStatuses.map(s => <SelectItem key={s.id} value={s.label}>{s.label}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader><TableRow>
                                        <TableHead>Event</TableHead><TableHead>User</TableHead><TableHead>Attendees</TableHead>
                                        <TableHead>Total Enrolled</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow></TableHeader>
                                    <TableBody>
                                        {!isClient ? Array.from({ length: 3 }).map((_, i) => (
                                            <TableRow key={`skel-event-${i}`}>
                                                <TableCell><Skeleton className="h-5 w-32" /></TableCell><TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                                <TableCell><Skeleton className="h-5 w-16" /></TableCell><TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                                <TableCell><Skeleton className="h-5 w-24" /></TableCell><TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                                                <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                            </TableRow>
                                        )) : filteredEventBookings.length === 0 ? (
                                            <TableRow><TableCell colSpan={7} className="text-center h-24">No event bookings found.</TableCell></TableRow>
                                        ) : (
                                            filteredEventBookings.map(b => (
                                                <TableRow key={b.id}>
                                                    <TableCell className="font-medium">{b.event}</TableCell><TableCell>{b.user}</TableCell><TableCell>{b.quantity}</TableCell>
                                                    <TableCell>{b.total_enrolled}</TableCell><TableCell>{b.date}</TableCell><TableCell><StatusBadge status={b.status} /></TableCell>
                                                    <TableCell className="text-right">
                                                         <DropdownMenu>
                                                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem onSelect={() => handleEventEditClick(b)}><Pencil className="mr-2 h-4 w-4" />Manage</DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem onSelect={() => handleCancelClick(b)} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" />Cancel</DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Edit Court Booking Dialog */}
            {selectedCourtBooking && <Dialog open={isCourtEditDialogOpen} onOpenChange={setIsCourtEditDialogOpen}>
                <DialogContent><DialogHeader><DialogTitle>Edit Court Booking</DialogTitle></DialogHeader>
                    <form onSubmit={(e) => { e.preventDefault(); 
                        const formData = new FormData(e.currentTarget);
                        if(editTimeslot) formData.set('timeslot_id', editTimeslot.id);
                        handleFormSubmit(updateBooking(formData), "Booking updated.", "Update Failed"); 
                    }}>
                        <input type="hidden" name="id" value={selectedCourtBooking.id} />
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Court</Label>
                                <Select name="court_id" value={editCourtId} onValueChange={setEditCourtId}>
                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                    <SelectContent>{allCourts.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn("w-full justify-start text-left font-normal", !selectedCourtBooking.raw_date && "text-muted-foreground")}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {editDate ? format(parseISO(editDate), 'PPP') : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={selectedCourtBooking.raw_date}
                                            onSelect={(d) => d && setEditDate(formatISO(d, { representation: 'date' }))}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="space-y-2">
                                <Label>Timeslot</Label>
                                <div className="grid grid-cols-3 gap-2">
                                    {isEditLoadingSlots ? (
                                        [...Array(3)].map((_, i) => <Skeleton key={i} className="h-9 w-full" />)
                                    ) : editAvailableSlots.length > 0 ? (
                                        editAvailableSlots.map((slot) => (
                                            <div title={slot.reasonDesc} key={slot.id}>
                                                <Button
                                                    type="button"
                                                    variant={editTimeslot?.id === slot.id ? "default" : "outline"}
                                                    onClick={() => setEditTimeslot(slot)}
                                                    disabled={slot.isDisable}
                                                    className={cn("w-full", slot.isDisable && "text-muted-foreground line-through")}
                                                    style={{ backgroundColor: slot.isDisable ? slot.color : '' }}
                                                >
                                                    {slot.startTime}
                                                </Button>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="col-span-3 text-center text-sm text-muted-foreground">
                                            No available slots.
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select name="status" defaultValue={selectedCourtBooking.status}>
                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                    <SelectContent>{courtBookingStatuses.map(s => <SelectItem key={s.id} value={s.label}>{s.label}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter><DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose><Button type="submit">Save</Button></DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>}

            <Dialog open={isAddDialogOpen} onOpenChange={handleAddDialogChange}>
                <DialogContent className="max-h-[90vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Add New Court Booking</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={(e) => { e.preventDefault(); 
                        const formData = new FormData(e.currentTarget);
                        if (addDate) formData.set('date', formatISO(addDate, { representation: 'date' }));
                        if (addSelectedTimeSlot) formData.set('timeslot_id', addSelectedTimeSlot.startTime);
                        handleFormSubmit(addBooking(formData), "Booking added.", "Add Failed");
                    }}>
                        <div className="space-y-4 py-4 overflow-y-auto pr-4">
                            <div className="space-y-2">
                                <Label>User</Label>
                                <Select name="user_id" onValueChange={setAddUserId} value={addUserId}>
                                    <SelectTrigger><SelectValue placeholder="Select user"/></SelectTrigger>
                                    <SelectContent>{allUsers.map(u => <SelectItem key={u.id} value={u.id.toString()}>{u.name}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Court</Label>
                                <Select name="court_id" onValueChange={setAddCourtId} value={addCourtId}>
                                    <SelectTrigger><SelectValue placeholder="Select court"/></SelectTrigger>
                                    <SelectContent>{allCourts.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            {addCourtRules && (
                                <Card className="bg-muted/50 text-sm">
                                    <CardHeader className="p-3">
                                        <CardTitle className="text-base flex items-center gap-2"><Info className="h-4 w-4"/> Court Rules</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-3 pt-0 text-muted-foreground space-y-1">
                                        <p><strong>Booking Window:</strong> {addCourtRules.booking_window} day(s)</p>
                                        <div className="flex items-center gap-2"><strong>One per day:</strong> <Badge variant={addCourtRules.one_booking_per_user_per_day ? 'default' : 'secondary'}>{addCourtRules.one_booking_per_user_per_day ? 'Yes' : 'No'}</Badge></div>
                                        <div className="flex items-center gap-2"><strong>Rolling 24hr:</strong> <Badge variant={addCourtRules.is_booking_rolling ? 'default' : 'secondary'}>{addCourtRules.is_booking_rolling ? 'Yes' : 'No'}</Badge></div>
                                    </CardContent>
                                </Card>
                            )}
                            <div className="flex justify-center">
                                <Calendar
                                    mode="single"
                                    selected={addDate}
                                    onSelect={setAddDate}
                                    className="rounded-md border"
                                    disabled={(date) =>
                                        date < new Date(new Date().setDate(new Date().getDate() - 1)) || date > maxBookableDate
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <h4 className="mb-2 text-sm font-medium text-center">
                                    Available Slots for {addDate ? format(addDate, "PPP") : "..."}
                                </h4>
                                <div className="grid grid-cols-3 gap-2">
                                    {isAddLoadingSlots ? (
                                        [...Array(6)].map((_, i) => <Skeleton key={i} className="h-9 w-full" />)
                                    ) : addAvailableSlots.length > 0 ? (
                                        addAvailableSlots.map((slot) => (
                                            <div title={slot.reasonDesc} key={slot.id}>
                                                <Button
                                                    type="button"
                                                    variant={addSelectedTimeSlot?.id === slot.id ? "default" : "outline"}
                                                    onClick={() => setAddSelectedTimeSlot(slot)}
                                                    disabled={slot.isDisable}
                                                    className={cn("w-full", slot.isDisable && "text-muted-foreground line-through")}
                                                    style={{ backgroundColor: slot.isDisable ? slot.color : '' }}
                                                >
                                                    {slot.startTime}
                                                </Button>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="col-span-3 text-center text-sm text-muted-foreground">
                                            No available slots.
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select name="status" defaultValue="Pending"><SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>{courtBookingStatuses.map(s => <SelectItem key={s.id} value={s.label}>{s.label}</SelectItem>)}</SelectContent></Select>
                            </div>
                        </div>
                        <DialogFooter className="pt-4 border-t"><DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose><Button type="submit" disabled={!addSelectedTimeSlot}>Add Booking</Button></DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
            
            {/* Edit Event Booking Dialog */}
            {selectedEventBooking && (
                 <Dialog open={isEventEditDialogOpen} onOpenChange={setIsEventEditDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Manage Event Booking</DialogTitle>
                            <DialogDescription>Update the status for this booking.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={(e) => { e.preventDefault(); handleFormSubmit(updateEventBookingStatus(new FormData(e.currentTarget)), "Event booking updated.", "Update Failed"); }}>
                            <input type="hidden" name="id" value={selectedEventBooking.id} />
                            <div className="space-y-4 py-4">
                                <div className="font-medium">
                                    <p>User: <span className="font-normal">{selectedEventBooking.user}</span></p>
                                    <p>Event: <span className="font-normal">{selectedEventBooking.event}</span></p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="event_status">Status</Label>
                                    <Select name="status" defaultValue={selectedEventBooking.status}>
                                        <SelectTrigger id="event_status"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {eventBookingStatuses.map(s => (
                                                <SelectItem key={s.id} value={s.label}>{s.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                             <DialogFooter>
                                <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                                <Button type="submit">Save Status</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            )}

             <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will cancel the {bookingToCancel?.type} booking for <span className="font-bold">{bookingToCancel?.user}</span> on <span className="font-bold">{bookingToCancel?.item}</span>. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Close</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmCancel} className="bg-destructive hover:bg-destructive/90">Confirm Cancellation</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
