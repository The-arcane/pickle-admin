

import { createServer } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronLeft, Clock, Home, User } from 'lucide-react';
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
    
    const now = new Date().toISOString();

    const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
            id, booking_status,
            user:user_id(id, name), 
            timeslots:timeslot_id!inner(date, start_time, end_time),
            booking_status:booking_status(label)
        `)
        .eq('court_id', courtId)
        .gte('timeslots.end_time', now)
        .order('date', { referencedTable: 'timeslots', ascending: true })
        .order('start_time', { referencedTable: 'timeslots', ascending: true });
    
    if (bookingsError) {
        console.error("Error fetching bookings for court:", bookingsError);
    }
    
    let bookingsWithFlatDetails = bookings || [];
    if (bookings && bookings.length > 0) {
        const userIds = bookings.map(b => b.user?.id).filter(Boolean) as number[];
        
        if (userIds.length > 0) {
            const { data: orgData } = await supabase
                .from('user_organisations')
                .select(`
                    user_id,
                    flats!left(flat_number, building_numbers(number, buildings(name)))
                `)
                .in('user_id', userIds);
                
            const userOrgMap = new Map();
            if (orgData) {
                orgData.forEach(org => {
                    userOrgMap.set(org.user_id, org);
                });
            }
            
            bookingsWithFlatDetails = bookings.map(booking => ({
                ...booking,
                user_organisation: booking.user ? userOrgMap.get(booking.user.id) : null
            }));
        }
    }

    const getFlatDetails = (booking: any) => {
        const org = booking.user_organisation;
        if (!org || !org.flats) return null;
        
        const flat = org.flats;
        const buildingNumber = flat.building_numbers;
        const building = buildingNumber?.buildings;

        if (building && buildingNumber && flat) {
            return `${building.name}, ${buildingNumber.number}, Flat ${flat.flat_number}`;
        }
        return null;
    }


    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <Button asChild variant="outline" size="icon" className="shrink-0">
                    <Link href="/super-admin/courts"><ChevronLeft className="h-4 w-4" /></Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Upcoming Bookings for {court.name}</h1>
                    <p className="text-muted-foreground">A list of all upcoming bookings for this court.</p>
                </div>
            </div>
            
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bookingsWithFlatDetails && bookingsWithFlatDetails.length > 0 ? (
                    bookingsWithFlatDetails.map(b => {
                        const flatDetails = getFlatDetails(b);
                        return (
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
                                    {flatDetails && (
                                         <div className="flex items-center gap-2 text-muted-foreground">
                                            <Home className="h-4 w-4" />
                                            <span>{flatDetails}</span>
                                        </div>
                                    )}
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
                        )
                    })
                ) : (
                    <div className="col-span-full text-center py-10 text-muted-foreground">
                        No upcoming bookings found for this court.
                    </div>
                )}
            </div>
        </div>
    )
}
