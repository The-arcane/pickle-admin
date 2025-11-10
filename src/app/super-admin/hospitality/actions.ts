
'use server';

import { revalidatePath } from 'next/cache';
import { createServiceRoleServer } from '@/lib/supabase/server';

export async function removeHospitalityOrg(formData: FormData) {
    const supabaseAdmin = await createServiceRoleServer();
    const orgId = formData.get('org_id') as string;

    if (!orgId) {
        return { error: 'Organization ID is required.' };
    }

    const { error } = await supabaseAdmin.from('organisations').delete().eq('id', Number(orgId));

    if (error) {
        console.error("Error removing hospitality org:", error);
        return { error: "Failed to remove hospitality organization." };
    }
    
    revalidatePath('/super-admin/hospitality');
    return { success: true, message: "Hospitality organization removed successfully." };
}
