'use server';

import { createServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { parseISO, getDay, parse } from 'date-fns';

const statusMapToDb: { [key: string]: number } = {
  'Cancelled': 0,
  'Confirmed': 1,
  'Pending': 2,
};

export async function addBooking(formData: FormData) {
  const supabase = createServer();
  const user_id = formData.get('user_id') as string;
  const court_id = formData.get('court_id') as string;
  const timeslot_id = formData.get('timeslot_id') as string;
  const status = formData.get('status') as string;
  
  const statusValue = statusMapToDb[status];

  if (!user_id || !court_id || !timeslot_id || statusValue === undefined) {
    return { error: 'All fields are required.' };
  }

  const { error } = await supabase
    .from('bookings')
    .insert({ 
      user_id: Number(user_id),
      court_id: Number(court_id),
      timeslot_id: Number(timeslot_id),
      status: statusValue,
     });

  if (error) {
    console.error('Error adding booking:', error);
    return { error: 'Failed to add booking.' };
  }

  revalidatePath('/dashboard/bookings');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function updateBooking(formData: FormData) {
  const supabase = createServer();
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
      status: statusValue,
      court_id: Number(court_id),
      timeslot_id: Number(timeslot_id),
     })
    .eq('id', id);

  if (error) {
    console.error('Error updating booking:', error);
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
    console.log(`[getTimeslots] Fetching for courtId: ${courtId}, date: ${dateString}, excluding: ${bookingIdToExclude}`);
    const supabase = createServer();
    
    if (!dateString) {
        console.error("[getTimeslots] Date string is missing.");
        return [];
    }
    
    const selectedDate = parseISO(dateString);
    const dayOfWeek = getDay(selectedDate); // 0 = Sunday, 1 = Monday, ...

    // 1. Fetch all data needed for filtering in parallel
    const [
        { data: allTimeslots, error: timeslotsError },
        { data: recurringUnavailability, error: recurringError },
        { data: oneOffUnavailability, error: oneOffError }
    ] = await Promise.all([
        supabase.from('timeslots').select('id, start_time, end_time').eq('court_id', courtId).eq('date', dateString).order('start_time'),
        supabase.from('recurring_unavailability').select('start_time, end_time').eq('court_id', courtId).eq('day_of_week', dayOfWeek).eq('active', true),
        supabase.from('availability_blocks').select('start_time, end_time').eq('court_id', courtId).eq('date', dateString)
    ]);
    
    // Fetch bookings separately as it doesn't depend on the date directly
    const { data: bookingsData, error: bookingsError } = await supabase.from('bookings').select('id, timeslot_id');

    if (timeslotsError || bookingsError || recurringError || oneOffError) {
        console.error('Error fetching availability data:', { timeslotsError, bookingsError, recurringError, oneOffError });
        return [];
    }

    if (!allTimeslots || allTimeslots.length === 0) {
        console.log(`[getTimeslots] No timeslots found in DB for court ${courtId} on ${dateString}.`);
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
    
    // 3. Prepare unavailability periods for comparison
    const unavailabilityPeriods: { start: Date, end: Date }[] = [];
    
    // Process recurring unavailability for the day of the week
    recurringUnavailability?.forEach(block => {
        if(block.start_time && block.end_time) {
            const start = parse(`${dateString}T${block.start_time}`);
            const end = parse(`${dateString}T${block.end_time}`);
            if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
                unavailabilityPeriods.push({ start, end });
            }
        }
    });

    // Process one-off unavailability blocks for the specific date
    oneOffUnavailability?.forEach(block => {
        const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));

        const start = block.start_time ? parse(`${dateString}T${block.start_time}`) : startOfDay;
        const end = block.end_time ? parse(`${dateString}T${block.end_time}`) : endOfDay;
        
        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
            unavailabilityPeriods.push({ start, end });
        }
    });

    // 4. Filter slots based on all unavailability periods
    if (unavailabilityPeriods.length > 0) {
        availableTimeslots = availableTimeslots.filter(slot => {
            if (!slot.start_time || !slot.end_time) return false;
            
            const slotStart = parseISO(slot.start_time);
            const slotEnd = parseISO(slot.end_time);

            if (isNaN(slotStart.getTime()) || isNaN(slotEnd.getTime())) return false;

            const isUnavailable = unavailabilityPeriods.some(block => 
                isOverlapping(slotStart, slotEnd, block.start, block.end)
            );

            return !isUnavailable; // Keep the slot if it is NOT unavailable
        });
    }

    console.log(`[getTimeslots] Returning ${availableTimeslots.length} available timeslots after all filters.`);
    return availableTimeslots;
}