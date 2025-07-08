'use server';

import { createServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function deleteEvent(formData: FormData) {
    const supabase = createServer();
    const id = formData.get('id') as string;

    if (!id) {
        return { error: 'Event ID is missing.' };
    }
    
    // Note: To be fully robust, this should also handle deleting related data
    // and images from storage. For now, we'll just delete the DB record.

    const { error } = await supabase.from('events').delete().eq('id', id);
    if(error) {
        console.error('Error deleting event:', error);
        return { error: `Failed to delete event: ${error.message}` };
    }
    
    revalidatePath('/super-admin/events');
    return { success: true };
}
