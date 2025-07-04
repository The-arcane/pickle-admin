'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/status-badge';
import { Calendar as CalendarIcon, Pencil } from 'lucide-react';
import { addBooking, updateBooking, getTimeslots } from './actions';
import { useToast } from "@/hooks/use-toast";
import { format, parseISO, formatISO } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

type BookingFromDb = {
  id: number;
  status: number;
  court_id: number;
  timeslot_id: number;
  user: { name: string } | null;
  courts: { name: string } | null;
  timeslots: { date: string | null; start_time: string | null, end_time: string | null } | null;
};

type ProcessedBooking = {
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

const statusMap: { [key: number]: string } = {
  0: 'Cancelled',
  1: 'Confirmed',
  2: 'Pending',
};

const formatTime = (timeString: string | null) => {
    if (!timeString) return '';
    try {
        return format(parseISO(timeString), 'p');
    } catch (e) {
        console.error(`Failed to parse time: ${timeString}`, e);
        return "Invalid Time";
    }
}

export function BookingsClientPage({ bookings: initialBookings, courts: allCourts, users: allUsers }: { bookings: BookingFromDb[], courts: Court[], users: User[] }) {
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<ProcessedBooking | null>(null);
    const { toast } = useToast();
    
    const [processedBookings, setProcessedBookings] = useState<ProcessedBooking[]>([]);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const bookings = initialBookings.map((booking) => {
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
                status: statusMap[booking.status] ?? 'Unknown',
                court_id: booking.court_id,
                timeslot_id: booking.timeslot_id,
                raw_date: timeslot?.date ? date : undefined
            };
        });
        setProcessedBookings(bookings);
    }, [initialBookings]);

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
                .then(setAvailableTimeslots)
                .finally(() => setIsLoadingTimeslots(false));
        } else {
            setAvailableTimeslots([]);
        }
    }, [selectedCourtId, selectedDate, selectedBooking, isEditDialogOpen]);

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


    const handleEditClick = (booking: ProcessedBooking) => {
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

    const memoizedBookings = useMemo(() => {
        if (!isClient) {
            return Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
            ));
        }

        if (processedBookings.length === 0) {
            return (
                <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No bookings found.
                    </TableCell>
                </TableRow>
            );
        }

        return processedBookings.map((booking) => (
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
    }, [isClient, processedBookings]);

  return (
    <>
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                <h1 className="text-3xl font-bold">Bookings</h1>
                <p className="text-muted-foreground">A list of all recent bookings.</p>
                </div>
                <Button onClick={() => setIsAddDialogOpen(true)}>Add Booking</Button>
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
                        {memoizedBookings}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>
        </div>

        {/* Edit Booking Dialog */}
        {selectedBooking && (
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Booking</DialogTitle>
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
                                    initialFocus
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
                                    <SelectItem value="Confirmed">Confirmed</SelectItem>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                    <SelectItem value="Cancelled">Cancelled</SelectItem>
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

        {/* Add Booking Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Booking</DialogTitle>
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
                                    initialFocus
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
                                    <SelectItem value="Confirmed">Confirmed</SelectItem>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                    <SelectItem value="Cancelled">Cancelled</SelectItem>
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
