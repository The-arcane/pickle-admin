

'use server';

import { revalidatePath } from 'next/cache';
import { createServiceRoleServer } from '@/lib/supabase/server';

export async function removeArenaOrg(formData: FormData) {
    const supabaseAdmin = await createServiceRoleServer();
    const orgId = formData.get('org_id') as string;

    if (!orgId) {
        return { error: 'Organization ID is required.' };
    }

    const { error } = await supabaseAdmin.from('organisations').delete().eq('id', Number(orgId));

    if (error) {
        console.error("Error removing Arena org:", error);
        return { error: "Failed to remove Arena organization." };
    }
    
    revalidatePath('/super-admin/arena');
    return { success: true, message: "Arena organization removed successfully." };
}
