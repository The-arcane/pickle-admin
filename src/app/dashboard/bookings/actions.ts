'use server';

import { createServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

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


export async function getTimeslots(courtId: number, dateString: string, currentBookingId?: number) {
    console.log(`Fetching timeslots for courtId: ${courtId}, date: ${dateString}, currentBookingId: ${currentBookingId}`);
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
        console.log('No timeslots found for the given court and date.');
        return [];
    }
    console.log(`Found ${allTimeslots.length} total timeslots for this day.`);

    // 2. Get the IDs of all timeslots for the selected day that are already booked
    const allTimeslotIds = allTimeslots.map(slot => slot.id);

    const bookingsQuery = supabase
        .from('bookings')
        .select('timeslot_id')
        .in('timeslot_id', allTimeslotIds)
        .in('status', [1, 2]); // Confirmed or Pending

    // If we're editing a booking, exclude it from the check
    if (currentBookingId) {
        bookingsQuery.neq('id', currentBookingId);
    }
    
    const { data: bookedSlots, error: bookingsError } = await bookingsQuery;

    if (bookingsError) {
        console.error('Error fetching booked slots:', bookingsError);
        // Fail open: If we can't check for other bookings, return all slots for the day.
        return allTimeslots;
    }

    const bookedTimeslotIds = new Set(bookedSlots.map(b => b.timeslot_id));
    console.log(`Found ${bookedTimeslotIds.size} booked timeslots.`);
    
    // 3. Filter the full list of timeslots, keeping only those that are NOT booked by others.
    const availableTimeslots = allTimeslots.filter(slot => !bookedTimeslotIds.has(slot.id));
    console.log(`Returning ${availableTimeslots.length} available timeslots.`);

    return availableTimeslots;
}
