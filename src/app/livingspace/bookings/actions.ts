
'use server';

import { createServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { parseISO, getDay, format, addDays, isBefore, startOfDecade } from 'date-fns';
import { randomUUID } from 'crypto';

const statusMapToDb: { [key: string]: number } = {
  'Pending': 1,
  'Confirmed': 2,
  'Cancelled': 3,
  'Completed': 4,
  'No-show': 5,
  'Ongoing': 6
};

const eventStatusMapToDb: { [key: string]: number } = {
  'Pending': 1,
  'Confirmed': 2,
  'Cancelled': 3,
};


async function findOrCreateTimeslot(supabase: any, court_id: number, date: string, start_time: string, end_time: string): Promise<number | null> {
    let { data: existingTimeslot, error: findError } = await supabase
        .from('timeslots')
        .select('id')
        .eq('court_id', court_id)
        .eq('date', date)
        .eq('start_time', start_time)
        .eq('end_time', end_time)
        .maybeSingle();

    if (findError) {
        console.error("Error finding timeslot:", findError);
        return null;
    }

    if (existingTimeslot) {
        return existingTimeslot.id;
    }

    const { data: newTimeslot, error: createError } = await supabase
        .from('timeslots')
        .insert({
            court_id,
            date,
            start_time,
            end_time
        })
        .select('id')
        .single();
    
    if (createError) {
        console.error("Error creating timeslot:", createError);
        return null;
    }

    return newTimeslot.id;
}


export async function addBooking(formData: FormData) {
  const supabase = await createServer();
  const user_id = formData.get('user_id') as string;
  const court_id = formData.get('court_id') as string;
  const timeslot_id = formData.get('timeslot_id') as string;
  const status = formData.get('status') as string;
  const date_string = formData.get('date') as string;

  const statusValue = statusMapToDb[status];

  if (!user_id || !court_id || !timeslot_id || statusValue === undefined || !date_string) {
    return { error: 'All fields are required.' };
  }
  
  const qr_content_id = `C${randomUUID()}`;

  const { error } = await supabase
    .from('bookings')
    .insert({ 
      user_id: Number(user_id),
      court_id: Number(court_id),
      timeslot_id: Number(timeslot_id),
      booking_status: statusValue,
      qr_content_id: qr_content_id,
     });

  if (error) {
    console.error('Error adding booking:', error);
    if (error.code === '23505') {
        return { error: 'This timeslot is already booked. Please choose another.' };
    }
    return { error: `Failed to add booking: ${error.message}` };
  }

  revalidatePath('/livingspace/bookings');
  revalidatePath('/livingspace');
  revalidatePath('/arena/bookings');
  return { success: true };
}

export async function updateBooking(formData: FormData) {
  const supabase = await createServer();
  const id = formData.get('id') as string;
  const status = formData.get('status') as string;
  const court_id = formData.get('court_id') as string;
  const timeslot_id = formData.get('timeslot_id') as string;

  if (!id) {
    return { error: 'Booking ID is missing.' };
  }
  
  // Find the correct numeric value for the status label
  const statusObject = await supabase.from('booking_status').select('id').eq('label', status).single();
  if (!statusObject.data) {
    return { error: 'Invalid status value.' };
  }
  const statusValue = statusObject.data.id;


  if (!court_id || !timeslot_id) {
    return { error: 'Court and Timeslot are required.' };
  }

  const { error } = await supabase
    .from('bookings')
    .update({ 
      booking_status: statusValue,
      court_id: Number(court_id),
      timeslot_id: Number(timeslot_id),
     })
    .eq('id', id);

  if (error) {
    console.error('Error updating booking:', error);
    if (error.code === '23505') {
        return { error: 'This timeslot is already booked by someone else.' };
    }
    return { error: 'Failed to update booking.' };
  }

  revalidatePath('/livingspace/bookings');
  revalidatePath('/livingspace');
  revalidatePath('/arena/bookings');
  return { success: true };
}

export async function cancelBooking(formData: FormData) {
    const supabase = await createServer();
    const id = formData.get('id') as string;

    if (!id) {
        return { error: 'Booking ID is missing.' };
    }

    const { error } = await supabase
        .from('bookings')
        .update({ booking_status: 3 }) // 3 is for Cancelled
        .eq('id', id);
    
    if (error) {
        console.error('Error cancelling booking:', error);
        return { error: `Failed to cancel booking: ${error.message}` };
    }

    revalidatePath('/livingspace/bookings');
    revalidatePath('/arena/bookings');
    revalidatePath('/livingspace');
    return { success: true, message: 'Booking has been cancelled.' };
}

export async function updateEventBookingStatus(formData: FormData) {
  const supabase = await createServer();
  const id = formData.get('id') as string;
  const status = formData.get('status') as string;

  if (!id || !status) {
    return { error: 'Booking ID and status are required.' };
  }

  const statusId = eventStatusMapToDb[status];
  if (statusId === undefined) {
    return { error: 'Invalid event booking status provided.' };
  }

  const { error } = await supabase
    .from('event_bookings')
    .update({ status: statusId })
    .eq('id', id);

  if (error) {
    console.error('Error updating event booking status:', error);
    return { error: `Failed to update event booking status: ${error.message}` };
  }

  revalidatePath('/livingspace/bookings');
  revalidatePath('/arena/bookings');
  return { success: true, message: 'Event booking status updated.' };
}

export async function getTimeslots(courtId: number, dateString: string, bookingIdToExclude?: number, targetUserId?: number) {
    const supabase = await createServer();

    if (!dateString) {
        console.error("[getTimeslots] Date string is missing.");
        return [];
    }

    // Call the database function to get available time slots.
    const { data: availableTimeslots, error } = await supabase.rpc('get_available_time_slots', {
      p_court_id: courtId,
      p_date: dateString,
      p_user_id: targetUserId // Pass user_id if you need to check user-specific rules within the function
    });
    
    if (error) {
        console.error('Error calling get_available_time_slots RPC:', error);
        return [];
    }
    
    // The RPC function should handle all the logic for availability, including:
    // - Existing bookings
    // - One-off unavailability
    // - Recurring unavailability
    // - Court's business hours (if applicable in the function)
    // - User-specific rules like one booking per day (if user_id is passed and handled)

    // The frontend code you shared implies a simple return of slots, so we'll do the same.
    // The 'id', 'startTime', and 'endTime' properties seem to be what the client expects.
    return availableTimeslots.map((slot: any) => ({
        id: slot.id,
        start_time: slot.starttime,
        end_time: slot.endtime,
        isDisable: slot.isdisable,
        reasonDesc: slot.reasondesc,
        color: slot.color
    }));
}
