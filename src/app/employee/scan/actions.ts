
'use server';

import { createServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { format, parseISO } from 'date-fns';

type QrData = {
    booking_id: number;
    user_id: number;
    court_id: number;
    timeslot_id: number;
}

const statusMapToDb: { [key: string]: number } = {
  'Cancelled': 0,
  'Confirmed': 1,
  'Pending': 2,
};

const statusMapFromDb: { [key: number]: string } = {
  0: 'Cancelled',
  1: 'Confirmed',
  2: 'Pending',
};

// This function assumes the QR code contains a JSON string with the booking details.
export async function verifyBookingByQr(qrDataString: string) {
    const supabase = createServer();
    let qrData: QrData;

    try {
        qrData = JSON.parse(qrDataString);
        if (!qrData.booking_id || !qrData.user_id || !qrData.court_id || !qrData.timeslot_id) {
            return { error: "Invalid QR code format." };
        }
    } catch (e) {
        return { error: "Could not read QR code. It may be invalid." };
    }

    // 1. Fetch the booking to verify it exists and matches the QR data
    const { data: booking, error: fetchError } = await supabase
        .from('bookings')
        .select(`
            id, status, user_id, court_id, timeslot_id, 
            user:user_id(name), 
            courts:court_id(name), 
            timeslots:timeslot_id(date, start_time, end_time)
        `)
        .eq('id', qrData.booking_id)
        .eq('user_id', qrData.user_id)
        .eq('court_id', qrData.court_id)
        .eq('timeslot_id', qrData.timeslot_id)
        .single();
    
    if (fetchError || !booking) {
        return { error: "Booking not found or QR data does not match." };
    }
    
    // 2. Check if the booking is already confirmed or cancelled
    if (booking.status === statusMapToDb['Confirmed']) {
         return { error: "This booking has already been checked in." };
    }
    if (booking.status === statusMapToDb['Cancelled']) {
        return { error: "This booking has been cancelled." };
    }

    // 3. Update the booking status to 'Confirmed'
    const { error: updateError } = await supabase
        .from('bookings')
        .update({ status: statusMapToDb['Confirmed'] })
        .eq('id', booking.id);
        
    if (updateError) {
        console.error("Error updating booking status:", updateError);
        return { error: "Failed to update booking status." };
    }

    // Revalidate paths to update caches
    revalidatePath('/dashboard/bookings');
    revalidatePath('/employee/bookings');

    // Return the verified data for display
    return {
        success: true,
        data: {
            user: booking.user?.name ?? 'N/A',
            court: booking.courts?.name ?? 'N/A',
            date: booking.timeslots?.date ? format(parseISO(booking.timeslots.date), 'PPP') : 'N/A',
            time: booking.timeslots?.start_time ? `${format(parseISO(booking.timeslots.start_time), 'p')} - ${format(parseISO(booking.timeslots.end_time!), 'p')}` : 'N/A',
            status: statusMapFromDb[statusMapToDb['Confirmed']],
        }
    }
}
