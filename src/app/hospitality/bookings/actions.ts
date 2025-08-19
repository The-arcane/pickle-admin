
'use server';

import { createServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateBookingStatus(formData: FormData) {
    const supabase = await createServer();
    const id = formData.get('id') as string;
    const status = formData.get('status') as string;
    const notes = formData.get('notes') as string;

    if (!id || !status) {
        return { error: 'Booking ID and status are required.' };
    }

    const { error } = await supabase
        .from('package_bookings')
        .update({
            status,
            notes,
            updated_at: new Date().toISOString()
        })
        .eq('id', id);
    
    if (error) {
        console.error("Error updating package booking:", error);
        return { error: `Failed to update booking: ${error.message}` };
    }

    revalidatePath('/hospitality/bookings');
    return { success: true };
}

// Future actions for creating/deleting bookings can go here.
