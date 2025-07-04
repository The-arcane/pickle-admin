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


export async function getTimeslots(courtId: number, dateString: string) {
    console.log(`[DEBUG] Fetching ALL timeslots for courtId: ${courtId}, date: ${dateString}`);
    const supabase = createServer();

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
        console.log(`[DEBUG] No timeslots found in DB for court ${courtId} on ${dateString}.`);
        return [];
    }
    
    console.log(`[DEBUG] Found ${allTimeslots.length} timeslots. Returning all of them.`);

    return allTimeslots;
}
