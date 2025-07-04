'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/status-badge';
import { Calendar as CalendarIcon, Pencil } from 'lucide-react';
import { updateBooking, getTimeslots } from './actions';
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

type Booking = {
  id: number;
  status: number;
  court_id: number;
  timeslot_id: number;
  user: { name: string } | null;
  courts: { name: string } | null;
  timeslots: { date: string | null; start_time: string | null } | null;
};

type Court = {
    id: number;
    name: string;
}

type Timeslot = {
    id: number;
    start_time: string | null;
    end_time: string | null;
}

// 0: Cancelled, 1: Confirmed, 2: Pending
const statusMap: { [key: number]: string } = {
  0: 'Cancelled',
  1: 'Confirmed',
  2: 'Pending',
};

const formatTime = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  try {
    return format(new Date(dateString), 'p');
  } catch (e) {
    return 'N/A';
  }
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
    try {
        return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
        return 'N/A';
    }
};

export function BookingsClientPage({ bookings: initialBookings, courts: allCourts }: { bookings: Booking[], courts: Court[] }) {
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
    const { toast } = useToast();

    // State for the edit dialog form
    const [selectedCourtId, setSelectedCourtId] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [availableTimeslots, setAvailableTimeslots] = useState<Timeslot[]>([]);
    const [isLoadingTimeslots, setIsLoadingTimeslots] = useState(false);

    useEffect(() => {
        if (selectedCourtId && selectedDate) {
            setIsLoadingTimeslots(true);
            getTimeslots(Number(selectedCourtId), selectedDate)
                .then(setAvailableTimeslots)
                .finally(() => setIsLoadingTimeslots(false));
        } else {
            setAvailableTimeslots([]);
        }
    }, [selectedCourtId, selectedDate]);


    const bookings = initialBookings.map((booking) => {
        const user = booking.user as { name: string } | null;
        const court = booking.courts as { name: string } | null;
        const timeslot = booking.timeslots as { date: string | null; start_time: string | null } | null;
        const userName = user?.name ?? 'N/A';

        return {
            id: booking.id,
            user: userName,
            court: court?.name ?? 'N/A',
            date: formatDate(timeslot?.date),
            time: formatTime(timeslot?.start_time),
            status: statusMap[booking.status] ?? 'Unknown',
            court_id: booking.court_id,
            timeslot_id: booking.timeslot_id,
            raw_date: timeslot?.date ? new Date(timeslot.date) : undefined
        };
    });

    const handleEditClick = (booking: any) => {
        setSelectedBooking(booking);
        setSelectedCourtId(booking.court_id.toString());
        setSelectedDate(booking.raw_date);
        setIsEditDialogOpen(true);
    };
    
    const handleFormAction = async (formData: FormData) => {
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

  return (
    <>
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                <h1 className="text-3xl font-bold">Bookings</h1>
                <p className="text-muted-foreground">A list of all recent bookings.</p>
                </div>
                <Button>Add Booking</Button>
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
                    {bookings.map((booking) => (
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
                    ))}
                    {bookings.length === 0 && (
                        <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                            No bookings found.
                        </TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>
        </div>

        {selectedBooking && (
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Booking</DialogTitle>
                </DialogHeader>
                <form action={handleFormAction}>
                    <input type="hidden" name="id" value={selectedBooking.id} />
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="court_id">Court</Label>
                            <Select name="court_id" defaultValue={selectedBooking.court_id.toString()} onValueChange={setSelectedCourtId}>
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
                            <Select name="timeslot_id" defaultValue={selectedBooking.timeslot_id.toString()} disabled={isLoadingTimeslots || availableTimeslots.length === 0}>
                                <SelectTrigger id="timeslot_id">
                                    <SelectValue placeholder={isLoadingTimeslots ? "Loading..." : "Select timeslot"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableTimeslots.map((slot) => (
                                        <SelectItem key={slot.id} value={slot.id.toString()}>{formatTime(slot.start_time)} - {formatTime(slot.end_time)}</SelectItem>
                                    ))}
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
    </>
  );
}
