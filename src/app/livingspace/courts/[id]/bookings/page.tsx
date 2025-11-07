
import { createServer } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronLeft, Clock, User } from 'lucide-react';
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
                    <Link href="/livingspace/courts"><ChevronLeft className="h-4 w-4" /></Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Bookings for {court.name}</h1>
                    <p className="text-muted-foreground">A list of all past and upcoming bookings for this court.</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bookings && bookings.length > 0 ? (
                    bookings.map(b => (
                        <Card key={b.id}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        {b.user?.name ?? 'N/A'}
                                    </CardTitle>
                                    <StatusBadge status={b.booking_status?.label ?? 'Unknown'} />
                                </div>
                            </CardHeader>
                            <CardContent className="text-sm space-y-2">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    <span>{b.timeslots?.date ? format(parseISO(b.timeslots.date), 'PP') : 'N/A'}</span>
                                </div>
                                 <div className="flex items-center gap-2 text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    <span>{`${formatTime(b.timeslots?.start_time)} - ${formatTime(b.timeslots?.end_time)}`}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full text-center py-10 text-muted-foreground">
                        No bookings found for this court.
                    </div>
                )}
            </div>
        </div>
    )
}
