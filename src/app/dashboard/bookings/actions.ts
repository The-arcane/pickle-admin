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

  if (!id) {
    return { error: 'Booking ID is missing.' };
  }
  
  const statusValue = statusMapToDb[status];
  if (statusValue === undefined) {
      return { error: 'Invalid status value.' };
  }

  const { error } = await supabase
    .from('bookings')
    .update({ status: statusValue })
    .eq('id', id);

  if (error) {
    console.error('Error updating booking:', error);
    return { error: 'Failed to update booking.' };
  }

  revalidatePath('/dashboard/bookings');
  revalidatePath('/dashboard');
  return { success: true };
}
