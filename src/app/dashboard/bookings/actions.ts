'use server';

import { createServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { parseISO, getDay } from 'date-fns';

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
    const supabase = createServer();
    
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
