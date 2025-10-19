
'use server';

import { createServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateOrganization(formData: FormData) {
    const supabase = await createServer();
    const id = formData.get('id');
    const name = formData.get('name') as string;
    const address = formData.get('address') as string;
    const logo = formData.get('logo') as string;

    if (!id) {
        return { error: 'Living Space ID is missing.' };
    }

    const { error } = await supabase
        .from('organisations')
        .update({ name, address, logo })
        .eq('id', id);

    if (error) {
        console.error("Error updating organization:", error);
        return { error: `Failed to update Living Space: ${error.message}` };
    }

    revalidatePath('/dashboard/organisations');
    revalidatePath('/dashboard'); // To update the name in the layout
    return { success: true };
}
