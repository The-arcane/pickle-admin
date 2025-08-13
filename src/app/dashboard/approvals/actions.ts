
'use server';

import { createServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function approveRequest(formData: FormData) {
    const supabase = await createServer();
    const approvalId = Number(formData.get('approval_id'));
    const userId = Number(formData.get('user_id'));
    const organisationId = Number(formData.get('organisation_id'));

    if (!approvalId || !userId || !organisationId) {
        return { error: 'Missing required IDs for approval.' };
    }

    // 1. Get the default 'user' role ID
    const { data: userRole, error: roleError } = await supabase
        .from('organisation_roles')
        .select('id')
        .eq('name', 'user')
        .single();
    
    if (roleError || !userRole) {
        return { error: `System error: Could not find the default 'user' role.`};
    }

    // 2. Start a transaction
    const { error } = await supabase.rpc('approve_user_for_organisation', {
        p_approval_id: approvalId,
        p_user_id: userId,
        p_organisation_id: organisationId,
        p_role_id: userRole.id
    });
   
    if (error) {
        console.error('Error approving request:', error);
        return { error: `Failed to approve request: ${error.message}` };
    }
    
    revalidatePath('/dashboard/approvals');
    revalidatePath('/dashboard/users');

    return { success: true, message: "User approved and linked to organization." };
}

export async function rejectRequest(formData: FormData) {
    const supabase = await createServer();
    const approvalId = Number(formData.get('approval_id'));

    if (!approvalId) {
        return { error: 'Approval ID is missing.' };
    }

    const { error } = await supabase
        .from('approvals')
        .delete()
        .eq('id', approvalId);

    if (error) {
        console.error('Error rejecting request:', error);
        return { error: `Failed to reject request: ${error.message}` };
    }

    revalidatePath('/dashboard/approvals');

    return { success: true, message: 'Request rejected.' };
}
