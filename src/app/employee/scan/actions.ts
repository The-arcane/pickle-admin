
'use server';

import { createServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { format, parseISO } from 'date-fns';
import { readQrCode } from '@/ai/flows/read-qr-code-flow';

const CONFIRMED_STATUS_ID_BOOKING = 1; // Assuming 1 is 'Confirmed' for bookings
const CONFIRMED_STATUS_ID_EVENT = 1; // Assuming 1 is 'Confirmed' for event bookings

export async function verifyBookingByImageDataUri(imageDataUri: string) {
    const supabase = createServer();

    if (!imageDataUri) {
        return { error: 'No image data provided.' };
    }

    let qrText: string;
    try {
        qrText = await readQrCode({ photoDataUri: imageDataUri });
        if (!qrText) {
            return { error: 'Could not read QR code from the image. Please try again.' };
        }
    } catch (e: any) {
        console.error("AI QR code reading failed:", e);
        return { error: "Failed to analyze the QR code image." };
    }

    const bookingType = qrText.charAt(0).toUpperCase();
    const qrContentId = qrText;

    if (bookingType === 'C') {
        // Handle Court Booking
        const { data: booking, error: fetchError } = await supabase
            .from('bookings')
            .select(`
                id, status,
                user:user_id(name), 
                courts:court_id(name), 
                timeslots:timeslot_id(date, start_time, end_time)
            `)
            .eq('qr_content_id', qrContentId)
            .single();

        if (fetchError || !booking) {
            return { error: `Court booking with ID ${qrContentId} not found.` };
        }
        
        if (booking.status === CONFIRMED_STATUS_ID_BOOKING) {
            return { error: "This court booking has already been checked in." };
        }

        const { error: updateError } = await supabase
            .from('bookings')
            .update({ status: CONFIRMED_STATUS_ID_BOOKING })
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
                id, status, quantity,
                user:user_id(name),
                events:event_id(title, start_time)
            `)
            .eq('qr_content_id', qrContentId)
            .single();
        
        if (fetchError || !eventBooking) {
            return { error: `Event booking with ID ${qrContentId} not found.` };
        }
        
        if (eventBooking.status === CONFIRMED_STATUS_ID_EVENT) {
            return { error: "This event booking has already been checked in." };
        }

        const { error: updateError } = await supabase
            .from('event_bookings')
            .update({ status: CONFIRMED_STATUS_ID_EVENT })
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
