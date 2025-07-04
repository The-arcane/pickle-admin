'use server';

import { createServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

const statusMapToDb: { [key: string]: number } = {
  'Cancelled': 0,
  'Confirmed': 1,
  'Pending': 2,
};

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


export async function getTimeslots(courtId: number, date: Date, bookingIdToExclude: number) {
    const supabase = createServer();
    const dateString = date.toISOString().split('T')[0];

    // 1. Get all timeslots for the selected court and date.
    const { data: allTimeslots, error: timeslotsError } = await supabase
        .from('timeslots')
        .select('id, start_time, end_time')
        .eq('court_id', courtId)
        .eq('date', dateString)
        .order('start_time');

    if (timeslotsError) {
        console.error('Error fetching timeslots:', timeslotsError);
        return [];
    }

    if (!allTimeslots || allTimeslots.length === 0) {
        return [];
    }

    const timeslotIds = allTimeslots.map(ts => ts.id);

    // 2. Get all bookings for these timeslots on the given date, *excluding the current booking being edited*.
    // This finds all the "conflicts".
    const { data: conflictingBookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('timeslot_id')
        .in('timeslot_id', timeslotIds)
        .neq('id', bookingIdToExclude) // Exclude the current booking from the conflict check
        .in('status', [1, 2]); // Only consider Confirmed or Pending bookings as conflicts

    if (bookingsError) {
        console.error('Error fetching conflicting bookings:', bookingsError);
        // Fail gracefully: return all timeslots but the UI will still work.
        return allTimeslots;
    }

    const bookedTimeslotIds = new Set(conflictingBookings.map(b => b.timeslot_id));

    // 3. Filter out the booked timeslots, leaving only available ones.
    const availableTimeslots = allTimeslots.filter(ts => !bookedTimeslotIds.has(ts.id));

    return availableTimeslots;
}
