
'use server';

import { createServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { parseISO, getDay, format } from 'date-fns';
import { randomUUID } from 'crypto';

const statusMapToDb: { [key: string]: number } = {
  'Cancelled': 0,
  'Confirmed': 1,
  'Pending': 2,
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

  revalidatePath('/dashboard/bookings');
  revalidatePath('/dashboard');
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
  
  const statusValue = statusMapToDb[status];
  if (statusValue === undefined) {
      return { error: 'Invalid status value.' };
  }

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

  revalidatePath('/dashboard/bookings');
  revalidatePath('/dashboard');
  return { success: true };
}

function isOverlapping(slotStart: Date, slotEnd: Date, blockStart: Date, blockEnd: Date): boolean {
    return slotStart < blockEnd && slotEnd > blockStart;
}

export async function getTimeslots(courtId: number, dateString: string, bookingIdToExclude?: number) {
    const supabase = await createServer();
    
    if (!dateString) {
        console.error("[getTimeslots] Date string is missing.");
        return [];
    }

    // 1. Fetch all possible timeslots for the court and date
    const { data: allTimeslots, error: timeslotsError } = await supabase
        .from('timeslots')
        .select('id, start_time, end_time')
        .eq('court_id', courtId)
        .eq('date', dateString)
        .order('start_time');

    if (timeslotsError || !allTimeslots) {
        console.error('Error fetching initial timeslots:', timeslotsError);
        return [];
    }

    // 2. Fetch the start times of already booked slots using the provided function
    const { data: bookedSlots, error: rpcError } = await supabase
        .rpc('get_booked_timeslots_for_court_and_date', {
            p_court_id: courtId,
            p_date: dateString
        });
    
    if (rpcError) {
        console.error('Error calling get_booked_timeslots_for_court_and_date:', rpcError);
        // Fallback to old method or just return all? For now, we'll return all to not block UI.
        // A better approach would be to handle this error gracefully on the client.
        // For now, let's assume if this fails, we can't determine booked slots.
        return allTimeslots;
    }

    const bookedStartTimes = new Set(bookedSlots.map((s: any) => s.start_time_str));
    
    // 3. Filter the initial list of timeslots to exclude the booked ones.
    const availableTimeslots = allTimeslots.filter(slot => {
        if (!slot.start_time) return false;
        
        // The start_time from timeslots table is a full timestamp, format it to HH:mm:ss to match the RPC output
        const formattedStartTime = format(parseISO(slot.start_time), 'HH:mm:ss');
        
        return !bookedStartTimes.has(formattedStartTime);
    });

    return availableTimeslots;
}
