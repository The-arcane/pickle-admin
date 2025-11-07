
import { createServer } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { StatusBadge } from '@/components/status-badge';

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

export default async function CourtBookingsPage({ params }: { params: { id: string } }) {
    const supabase = await createServer();
    const courtId = params.id;

    const { data: court, error: courtError } = await supabase
        .from('courts')
        .select('id, name')
        .eq('id', courtId)
        .single();
    
    if (courtError || !court) {
        notFound();
    }

    const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
            id, booking_status, user:user_id(name), 
            timeslots:timeslot_id(date, start_time, end_time),
            booking_status:booking_status(label)
        `)
        .eq('court_id', courtId)
        .order('id', { ascending: false });

    if (bookingsError) {
        console.error("Error fetching bookings for court:", bookingsError);
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Button asChild variant="outline" size="icon">
                    <Link href="/super-admin/courts"><ChevronLeft className="h-4 w-4" /></Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Bookings for {court.name}</h1>
                    <p className="text-muted-foreground">A list of all past and upcoming bookings for this court.</p>
                </div>
            </div>
            <Card>
                <CardContent className="pt-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Time</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {bookings && bookings.length > 0 ? (
                                bookings.map(b => (
                                    <TableRow key={b.id}>
                                        <TableCell>{b.user?.name ?? 'N/A'}</TableCell>
                                        <TableCell>{b.timeslots?.date ? format(parseISO(b.timeslots.date), 'PP') : 'N/A'}</TableCell>
                                        <TableCell>{`${formatTime(b.timeslots?.start_time)} - ${formatTime(b.timeslots?.end_time)}`}</TableCell>
                                        <TableCell><StatusBadge status={b.booking_status?.label ?? 'Unknown'} /></TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24">No bookings found for this court.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
