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


export async function getTimeslots(courtId: number, date: Date) {
  const supabase = createServer();
  const dateString = date.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('timeslots')
    .select('id, start_time, end_time')
    .eq('court_id', courtId)
    .eq('date', dateString)
    .order('start_time');

  if (error) {
    console.error('Error fetching timeslots:', error);
    return [];
  }
  return data;
}
