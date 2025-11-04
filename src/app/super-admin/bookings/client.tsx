
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
import { format, parseISO, formatISO, addDays } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

// Types for Court Bookings
type CourtBookingFromDb = {
  id: number;
  booking_status: number;
  court_id: number;
  timeslot_id: number;
  user: { name: string } | null;
  courts: { name: string, booking_window: number } | null;
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

type Court = {
    id: number;
    name: string;
    booking_window: number;
}

type User = {
    id: number;
    name: string;
}

type Timeslot = {
    id: string;
    startTime: string;
    endTime: string;
    isDisable: boolean;
    reasonDesc: string;
    color: string;
};

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
    courts: allCourts, 
    users: allUsers, 
    courtBookingStatuses,
    loading
}: { 
    initialCourtBookings: CourtBookingFromDb[], 
    courts: Court[], 
    users: User[], 
    courtBookingStatuses: BookingStatus[],
    loading: boolean
}) {
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<ProcessedCourtBooking | null>(null);
    const { toast } = useToast();
    
    const [processedCourtBookings, setProcessedCourtBookings] = useState<ProcessedCourtBooking[]>([]);

    const courtStatusMap = useMemo(() => {
        return courtBookingStatuses.reduce((acc, status) => {
            acc[status.id] = status.label;
            return acc;
        }, {} as { [key: number]: string });
    }, [courtBookingStatuses]);

    useEffect(() => {
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

    // State for Edit Dialog
    const [selectedCourtId, setSelectedCourtId] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [availableTimeslots, setAvailableTimeslots] = useState<Timeslot[]>([]);
    const [isLoadingTimeslots, setIsLoadingTimeslots] = useState(false);
    const [selectedTimeslotId, setSelectedTimeslotId] = useState<string>('');

    // State for Add Dialog
    const [addCourtId, setAddCourtId] = useState<string>('');
    const [addDate, setAddDate] = useState<Date | undefined>(new Date());
    const [addAvailableTimeslots, setAddAvailableTimeslots] = useState<Timeslot[]>([]);
    const [isAddLoadingTimeslots, setIsAddLoadingTimeslots] = useState(false);
    const [addSelectedTimeSlot, setAddSelectedTimeSlot] = useState<Timeslot | null>(null);


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
            setAddSelectedTimeSlot(null);
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
        if (addDate) formData.set('date', formatISO(addDate, { representation: 'date' }));
        if (addSelectedTimeSlot) formData.set('timeslot_id', addSelectedTimeSlot.startTime);

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
        if (loading) {
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

        if (processedCourtBookings.length === 0) {
            return (
                <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
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
                <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEditClick(booking)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit booking</span>
                    </Button>
                </TableCell>
            </TableRow>
        ));
    }, [loading, processedCourtBookings]);

    const selectedCourtForAdd = allCourts.find(c => c.id.toString() === addCourtId);
    const bookingWindow = selectedCourtForAdd?.booking_window || 7;
    const maxBookableDate = addDays(new Date(), bookingWindow - 1);

  return (
    <>
        <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Bookings</h1>
            <Button onClick={() => setIsAddDialogOpen(true)}>+ Add Booking</Button>
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
                                            <SelectItem key={slot.id} value={slot.id.toString()}>{formatTime(slot.startTime)} - {formatTime(slot.endTime)}</SelectItem>
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
            <DialogContent className="max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Add New Court Booking</DialogTitle>
                </DialogHeader>
                <form action={handleAddFormAction}>
                    <div className="space-y-4 py-4 overflow-y-auto pr-4">
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
                                {isAddLoadingTimeslots ? (
                                    [...Array(6)].map((_, i) => <Skeleton key={i} className="h-9 w-full" />)
                                ) : addAvailableTimeslots.length > 0 ? (
                                    addAvailableTimeslots.map((slot) => (
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
                    <DialogFooter className="pt-4 border-t">
                        <DialogClose asChild>
                            <Button type="button" variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={!addSelectedTimeSlot}>Add Booking</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
            </Dialog>
    </>
  );
}
