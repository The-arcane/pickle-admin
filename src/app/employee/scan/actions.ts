
'use server';

import { createServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { format, parseISO } from 'date-fns';

const CONFIRMED_STATUS_ID_BOOKING = 1; // Assuming 1 is 'Confirmed' for bookings
const CONFIRMED_STATUS_ID_EVENT = 1; // Assuming 1 is 'Confirmed' for event bookings

export async function verifyBookingByQrText(qrText: string) {
    const supabase = createServer();

    // Get Employee's Org ID
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: 'Authentication error. Please log in again.' };
    }
    const { data: userProfile } = await supabase
        .from('user')
        .select('user_organisations(organisation_id)')
        .eq('user_uuid', user.id)
        .single();
    
    const organisationId = (userProfile?.user_organisations as any)?.[0]?.organisation_id;

    if (!organisationId) {
        return { error: 'You are not assigned to an organization.' };
    }

    if (!qrText) {
        return { error: 'No QR code data provided.' };
    }

    const bookingType = qrText.charAt(0).toUpperCase();
    const qrContentId = qrText;

    if (bookingType === 'C') {
        // Handle Court Booking
        const { data: booking, error: fetchError } = await supabase
            .from('bookings')
            .select(`
                id, status, statuss,
                user:user_id(name), 
                courts:court_id!inner(name, organisation_id), 
                timeslots:timeslot_id(date, start_time, end_time)
            `)
            .eq('qr_content_id', qrContentId)
            .eq('courts.organisation_id', organisationId)
            .single();

        if (fetchError || !booking) {
            return { error: `Court booking with ID ${qrContentId} not found in your organization.` };
        }
        
        if (booking.statuss === 'visited') {
            return { error: "This court booking has already been checked in." };
        }

        const { error: updateError } = await supabase
            .from('bookings')
            .update({ status: CONFIRMED_STATUS_ID_BOOKING, statuss: 'visited' })
            .eq('id', booking.id);

        if (updateError) {
            return { error: 'Failed to update court booking status.' };
        }

        revalidatePath('/dashboard/bookings');
        revalidatePath('/employee/bookings');

        return {
            success: true,
            data: {
                type: 'Court Booking',
                user: booking.user?.name ?? 'N/A',
                item: booking.courts?.name ?? 'N/A',
                date: booking.timeslots?.date ? format(parseISO(booking.timeslots.date), 'PPP') : 'N/A',
                time: booking.timeslots?.start_time ? `${format(parseISO(booking.timeslots.start_time), 'p')} - ${format(parseISO(booking.timeslots.end_time!), 'p')}` : 'N/A',
            }
        };

    } else if (bookingType === 'E') {
        // Handle Event Booking
        const { data: eventBooking, error: fetchError } = await supabase
            .from('event_bookings')
            .select(`
                id, status, statuss, quantity,
                user:user_id(name),
                events:event_id!inner(title, start_time, organiser_org_id)
            `)
            .eq('qr_content_id', qrContentId)
            .eq('events.organiser_org_id', organisationId)
            .single();
        
        if (fetchError || !eventBooking) {
            return { error: `Event booking with ID ${qrContentId} not found in your organization.` };
        }
        
        if (eventBooking.statuss === 'visited') {
            return { error: "This event booking has already been checked in." };
        }

        const { error: updateError } = await supabase
            .from('event_bookings')
            .update({ status: CONFIRMED_STATUS_ID_EVENT, statuss: 'visited' })
            .eq('id', eventBooking.id);

        if (updateError) {
            return { error: 'Failed to update event booking status.' };
        }

        revalidatePath('/dashboard/bookings');
        revalidatePath('/employee/bookings');

        return {
            success: true,
            data: {
                type: 'Event Booking',
                user: eventBooking.user?.name ?? 'N/A',
                item: eventBooking.events?.title ?? 'N/A',
                date: eventBooking.events?.start_time ? format(parseISO(eventBooking.events.start_time), 'PPP p') : 'N/A',
                time: `Attendees: ${eventBooking.quantity}`,
            }
        };

    } else {
        return { error: "Invalid QR code content. It must start with 'C' or 'E'." };
    }
}
