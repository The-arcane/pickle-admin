
'use server';

import { createServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateCourtStatus(formData: FormData) {
    const supabase = await createServer();
    const courtId = formData.get('courtId') as string;
    const statusId = formData.get('statusId') as string;

    if (!courtId || !statusId) {
        return { error: 'Court ID and Status ID are required.' };
    }

    const { error } = await supabase
        .from('courts')
        .update({ status_id: Number(statusId) })
        .eq('id', courtId);
    
    if (error) {
        console.error('Error updating court status:', error);
        return { error: `Failed to update status: ${error.message}` };
    }

    revalidatePath('/super-admin/courts');
    revalidatePath('/livingspace/courts');
    revalidatePath('/arena/courts');
    
    return { success: true, message: 'Court status updated successfully.' };
}
