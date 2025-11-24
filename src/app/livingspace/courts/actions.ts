

'use server';

import { createServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function toggleCourtPublicStatus(courtId: number, isPublic: boolean) {
    const supabase = await createServer();

    const { error } = await supabase
        .from('courts')
        .update({ is_public: isPublic })
        .eq('id', courtId);

    if (error) {
        console.error('Error toggling court status:', error);
        return { error: `Failed to toggle court status: ${error.message}` };
    }

    revalidatePath('/livingspace/courts');
    return { success: true };
}
