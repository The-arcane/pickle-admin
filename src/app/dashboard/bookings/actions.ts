
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
    // This is a simplified example. In a real app, you might have pre-defined timeslots.
    // This function finds a timeslot or creates one if it doesn't exist.
    // NOTE: This assumes start_time and end_time are unique for a given court and date.
    
    // First, try to find an existing timeslot
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

    // If not found, create a new one
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
    if (error.code === '23505') { // Unique constraint violation
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


// Helper function to check for time overlaps
// All inputs are Date objects
function isOverlapping(slotStart: Date, slotEnd: Date, blockStart: Date, blockEnd: Date): boolean {
    return slotStart < blockEnd && slotEnd > blockStart;
}

export async function getTimeslots(courtId: number, dateString: string, bookingIdToExclude?: number) {
    const supabase = await createServer();
    
    if (!dateString) {
        console.error("[getTimeslots] Date string is missing.");
        return [];
    }
    
    // Use parseISO to ensure we get a date object at midnight UTC
    const selectedDate = parseISO(dateString);
    const dayOfWeek = getDay(selectedDate); // 0 = Sunday, 1 = Monday, ... (date-fns standard)

    // 1. Fetch all data needed for filtering in parallel
    const [
        { data: allTimeslots, error: timeslotsError },
        { data: recurringUnavailability, error: recurringError },
        { data: oneOffUnavailability, error: oneOffError },
        { data: bookingsData, error: bookingsError }
    ] = await Promise.all([
        supabase.from('timeslots').select('id, start_time, end_time').eq('court_id', courtId).eq('date', dateString).order('start_time'),
        supabase.from('recurring_unavailability').select('start_time, end_time').eq('court_id', courtId).eq('day_of_week', dayOfWeek).eq('active', true),
        supabase.from('availability_blocks').select('start_time, end_time').eq('court_id', courtId).eq('date', dateString),
        supabase.from('bookings').select('id, timeslot_id')
    ]);

    if (timeslotsError || bookingsError || recurringError || oneOffError) {
        console.error('Error fetching availability data:', { timeslotsError, bookingsError, recurringError, oneOffError });
        return [];
    }

    if (!allTimeslots || allTimeslots.length === 0) {
        return [];
    }

    // 2. Filter out already booked slots
    const timeslotIdsForDay = allTimeslots.map(t => t.id);
    const bookingsOnDate = bookingsData?.filter(b => timeslotIdsForDay.includes(b.timeslot_id));
    
    const bookedTimeslotIds = new Set(
        bookingsOnDate
            ?.filter(booking => booking.id !== bookingIdToExclude)
            .map(booking => booking.timeslot_id)
    );

    let availableTimeslots = allTimeslots.filter(
        slot => !bookedTimeslotIds.has(slot.id)
    );
    
    // 3. Prepare unavailability periods for comparison, ensuring all are in UTC
    const unavailabilityPeriods: { start: Date, end: Date }[] = [];
    const year = selectedDate.getUTCFullYear();
    const month = selectedDate.getUTCMonth();
    const day = selectedDate.getUTCDate();
    
    // Process recurring unavailability for the day of the week
    recurringUnavailability?.forEach(block => {
        if(block.start_time && block.end_time) {
            const [startHour, startMinute] = block.start_time.split(':').map(Number);
            const [endHour, endMinute] = block.end_time.split(':').map(Number);
            
            // Create UTC dates for comparison using native Date.UTC
            const blockStart = new Date(Date.UTC(year, month, day, startHour, startMinute));
            const blockEnd = new Date(Date.UTC(year, month, day, endHour, endMinute));

            unavailabilityPeriods.push({ start: blockStart, end: blockEnd });
        }
    });

    // Process one-off unavailability blocks for the specific date
    oneOffUnavailability?.forEach(block => {
        let blockStart, blockEnd;

        // If start/end times are null, block the whole day in UTC
        if (!block.start_time || !block.end_time) {
            blockStart = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
            blockEnd = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));
        } else {
            const [startHour, startMinute] = block.start_time.split(':').map(Number);
            const [endHour, endMinute] = block.end_time.split(':').map(Number);
            
            blockStart = new Date(Date.UTC(year, month, day, startHour, startMinute));
            blockEnd = new Date(Date.UTC(year, month, day, endHour, endMinute));
        }
        
        unavailabilityPeriods.push({ start: blockStart, end: blockEnd });
    });

    // 4. Filter slots based on all unavailability periods
    if (unavailabilityPeriods.length > 0) {
        availableTimeslots = availableTimeslots.filter(slot => {
            if (!slot.start_time || !slot.end_time) return false;
            
            // Timeslots from DB are timestamptz, parseISO handles them correctly into UTC Date objects
            const slotStart = parseISO(slot.start_time);
            const slotEnd = parseISO(slot.end_time);

            if (isNaN(slotStart.getTime()) || isNaN(slotEnd.getTime())) return false;

            const isUnavailable = unavailabilityPeriods.some(block => 
                isOverlapping(slotStart, slotEnd, block.start, block.end)
            );

            return !isUnavailable; // Keep the slot if it is NOT unavailable
        });
    }
    
    return availableTimeslots;
}
