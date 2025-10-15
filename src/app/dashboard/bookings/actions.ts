
'use server';

import { createServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { parseISO, getDay, format, addDays, isBefore, startOfDecade } from 'date-fns';
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

export async function getTimeslots(courtId: number, dateString: string, bookingIdToExclude?: number, targetUserId?: number) {
    const supabase = await createServer();
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    
    if (!dateString) {
        console.error("[getTimeslots] Date string is missing.");
        return [];
    }
    const selectedDate = parseISO(dateString);

    // 1. Fetch court rules and all timeslots for the court and date
    const { data: courtRules, error: courtRulesError } = await supabase
        .from('courts')
        .select('booking_window, one_booking_per_user_per_day, is_booking_rolling')
        .eq('id', courtId)
        .single();

    const { data: allTimeslots, error: timeslotsError } = await supabase
        .from('timeslots')
        .select('id, start_time, end_time')
        .eq('court_id', courtId)
        .eq('date', dateString)
        .order('start_time');

    if (courtRulesError || timeslotsError) {
        console.error('Error fetching court rules or timeslots:', courtRulesError || timeslotsError);
        return [];
    }

    if (!allTimeslots || !courtRules) {
        return [];
    }

    // --- Apply Advanced Booking Rules ---
    // Rule: Booking window (e.g., cannot book more than X days in advance)
    const bookingWindow = courtRules.booking_window ?? 1; // Default to 1 day if not set
    const maxBookingDate = addDays(new Date(), bookingWindow -1);
    if (isBefore(maxBookingDate, selectedDate)) {
        return []; // Selected date is outside the booking window
    }
    
    let filteredTimeslots = allTimeslots;

    // Rule: Rolling 24-hour booking window
    if (courtRules.is_booking_rolling) {
        const now = new Date();
        filteredTimeslots = filteredTimeslots.filter(slot => {
            if (!slot.start_time) return false;
            // Assuming start_time is timestamptz from DB
            const slotStartTime = parseISO(slot.start_time);
            return isBefore(now, slotStartTime) && isBefore(slotStartTime, addDays(now, 1));
        });
    }

    // Rule: One booking per user per day
    if (courtRules.one_booking_per_user_per_day) {
        // If a targetUserId is provided (admin booking for someone), check that user.
        // Otherwise, check the currently logged-in user (for user-facing booking flows).
        const userIdToCheck = targetUserId ? targetUserId : (await supabase.from('user').select('id').eq('user_uuid', currentUser?.id).single()).data?.id;

        if (userIdToCheck) {
            const { data: userBookings, error: userBookingsError } = await supabase
                .rpc('get_user_bookings_for_date', { p_user_id: userIdToCheck, p_date: dateString });
            
            if (userBookingsError) {
                console.error('Error fetching user bookings:', userBookingsError);
            } else if (userBookings && userBookings.length > 0) {
                 // Check if the user's booking is the one we are currently editing
                const isEditingOwnBooking = userBookings.length === 1 && bookingIdToExclude && userBookings[0].id === bookingIdToExclude;
                if (!isEditingOwnBooking) {
                    return []; // User already has a booking for this day, return no slots.
                }
            }
        }
    }


    // --- Check for existing bookings on the court ---
    const { data: bookedSlots, error: rpcError } = await supabase
        .rpc('get_booked_timeslots_for_court_and_date', {
            p_court_id: courtId,
            p_date: dateString
        });
    
    if (rpcError) {
        console.error('Error calling get_booked_timeslots_for_court_and_date:', rpcError);
        return filteredTimeslots;
    }

    const bookedStartTimes = new Set(bookedSlots.map((s: any) => s.start_time_str));
    
    const availableTimeslots = filteredTimeslots.filter(slot => {
        if (!slot.start_time) return false;
        
        // This formatting assumes the DB returns a full timestamp, but we only need HH:mm for comparison with the RPC result
        const formattedStartTime = format(parseISO(slot.start_time), 'HH:mm');
        
        return !bookedStartTimes.has(formattedStartTime);
    });

    // If editing a booking, we need to add its original timeslot back to the list so it can be re-selected.
    if (bookingIdToExclude) {
        const { data: currentBooking } = await supabase
            .from('bookings')
            .select('timeslot_id, timeslots(id, start_time, end_time)')
            .eq('id', bookingIdToExclude)
            .single();

        if (currentBooking?.timeslots) {
            const originalTimeslot = currentBooking.timeslots;
            // Check if it's not already in the list (e.g. if it was never booked by someone else)
            if (!availableTimeslots.some(t => t.id === originalTimeslot.id)) {
                 availableTimeslots.push({ id: originalTimeslot.id, start_time: originalTimeslot.start_time, end_time: originalTimeslot.end_time });
                 // Sort again to ensure correct order
                 availableTimeslots.sort((a, b) => a.start_time!.localeCompare(b.start_time!));
            }
        }
    }

    return availableTimeslots;
}
