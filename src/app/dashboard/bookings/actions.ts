'use server';

import { createServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { formatISO } from 'date-fns';

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


export async function getTimeslots(courtId: number, dateString: string, currentBookingId?: number) {
    const supabase = createServer();

    // 1. Get all timeslots for the court and date
    const { data: allTimeslots, error: timeslotsError } = await supabase
        .from('timeslots')
        .select('id, start_time, end_time')
        .eq('court_id', courtId)
        .eq('date', dateString)
        .order('start_time');

    if (timeslotsError) {
        console.error('Error fetching all timeslots:', timeslotsError);
        return [];
    }
    if (!allTimeslots || allTimeslots.length === 0) {
        return [];
    }

    // 2. Get the IDs of timeslots that are booked by OTHER confirmed/pending bookings
    // on the same date for the same court.
    const { data: otherBookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('timeslot_id, timeslots!inner(date)')
        .eq('court_id', courtId)
        .eq('timeslots.date', dateString)
        .in('status', [1, 2]) // Confirmed or Pending
        .neq('id', currentBookingId || 0); // Exclude the booking we are currently editing

    if (bookingsError) {
        console.error('Error fetching other bookings for availability check:', bookingsError);
        // Fail open: If we can't check for other bookings, return all slots for the day.
        return allTimeslots;
    }

    const otherBookedTimeslotIds = new Set(otherBookings.map(b => b.timeslot_id));
    
    // 3. Filter the full list of timeslots, keeping only those that are NOT booked by others.
    const availableTimeslots = allTimeslots.filter(slot => !otherBookedTimeslotIds.has(slot.id));

    return availableTimeslots;
}
