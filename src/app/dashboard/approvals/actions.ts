
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

    // Use a transaction to update both tables
    const { data, error } = await supabase.rpc('approve_user_for_organisation', {
        p_approval_id: approvalId,
        p_user_id: userId,
        p_organisation_id: organisationId,
    });
   
    if (error) {
        console.error('Error approving request:', error);
        return { error: `Failed to approve request: ${error.message}` };
    }
    
    revalidatePath('/dashboard/approvals');
    revalidatePath('/dashboard/users'); // Revalidate users page as their org has changed

    return { success: true, message: "User approved and linked to organization." };
}

export async function rejectRequest(formData: FormData) {
    const supabase = await createServer();
    const approvalId = Number(formData.get('approval_id'));

    if (!approvalId) {
        return { error: 'Approval ID is missing.' };
    }

    // Simply delete the approval request row
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
