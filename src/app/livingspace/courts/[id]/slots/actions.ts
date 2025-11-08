
'use server';

import { createServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { AvailabilityBlock } from '@/app/super-admin/courts/[id]/types';

export async function saveUnavailability(formData: FormData) {
    const supabase = await createServer();
    const courtId = Number(formData.get('court_id'));
    const availability = JSON.parse(formData.get('availability') as string) as Partial<AvailabilityBlock>[];
    const basePath = formData.get('basePath') as string || '/livingspace';

    if (!courtId) {
        return { error: 'Court ID is missing.' };
    }

    try {
        // --- Sync Availability Blocks ---
        const { data: existingAvailability } = await supabase.from('availability_blocks').select('id').eq('court_id', courtId);
        if (!existingAvailability) {
             return { error: "Could not fetch existing availability." };
        }
        
        const existingAvailabilityIds = existingAvailability.map(a => a.id);
        const newAvailabilityIds = availability.map(a => a.id).filter(Boolean);
        const availabilityToDelete = existingAvailabilityIds.filter(aId => !newAvailabilityIds.includes(aId as number));

        if (availabilityToDelete.length > 0) {
            const { error } = await supabase.from('availability_blocks').delete().in('id', availabilityToDelete);
            if (error) { 
                console.error('Error deleting availability:', error); 
                return { error: `Failed to delete old availability blocks: ${error.message}` }; 
            }
        }
        
        const availabilityToUpsert = availability.filter(a => a.date).map(a => {
            const record: any = { court_id: courtId, date: a.date, start_time: a.start_time || null, end_time: a.end_time || null, reason: a.reason };
            if (a.id) record.id = a.id;
            return record;
        });

        if (availabilityToUpsert.length > 0) {
            const { error } = await supabase.from('availability_blocks').upsert(availabilityToUpsert, { onConflict: 'id' });
            if (error) { 
                console.error('Error upserting availability:', error); 
                return { error: `Failed to save availability: ${error.message}` }; 
            }
        }
    } catch (e: any) {
        console.error('Server action error in saveUnavailability:', e);
        return { error: `An unexpected error occurred: ${e.message}` };
    }

    revalidatePath(`${basePath}/courts/${courtId}/slots`);
    return { success: true, message: 'Unavailability schedule updated successfully.' };
}
