
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

    // Step 1: Update the user's organisation_id in the user table
    const { error: userUpdateError } = await supabase
        .from('user')
        .update({ organisation_id: organisationId })
        .eq('id', userId);

    if (userUpdateError) {
        console.error('Error updating user organization:', userUpdateError);
        return { error: `Failed to update user profile: ${userUpdateError.message}` };
    }

    // Step 2: Mark the approval request as approved
    const { error: approvalUpdateError } = await supabase
        .from('approvals')
        .update({ is_approved: true })
        .eq('id', approvalId);

    if (approvalUpdateError) {
        console.error('Error updating approval status:', approvalUpdateError);
        // If this fails, we should ideally roll back the user update.
        // For now, we'll return an error message indicating a partial failure.
        return { error: `User profile updated, but failed to update approval status: ${approvalUpdateError.message}` };
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


// --- Bulk Actions ---

export async function approveMultipleRequests(approvals: { approvalId: number, userId: number, organisationId: number }[]) {
    const supabase = await createServer();

    if (!approvals || approvals.length === 0) {
        return { error: 'No approvals selected.' };
    }

    for (const approval of approvals) {
        // Step 1: Update the user's organisation_id in the user table
        const { error: userUpdateError } = await supabase
            .from('user')
            .update({ organisation_id: approval.organisationId })
            .eq('id', approval.userId);
        
        if (userUpdateError) {
            console.error(`Bulk approve: Error updating user ${approval.userId}`, userUpdateError);
            // Continue to next approval, but maybe log this failure
            continue;
        }

        // Step 2: Mark the approval request as approved
        const { error: approvalUpdateError } = await supabase
            .from('approvals')
            .update({ is_approved: true })
            .eq('id', approval.approvalId);
        
        if (approvalUpdateError) {
             console.error(`Bulk approve: Error updating approval ${approval.approvalId}`, approvalUpdateError);
             // Continue even if this part fails
        }
    }
    
    revalidatePath('/dashboard/approvals');
    revalidatePath('/dashboard/users');

    return { success: true, message: `${approvals.length} request(s) approved.` };
}

export async function rejectMultipleRequests(approvalIds: number[]) {
    const supabase = await createServer();

    if (!approvalIds || approvalIds.length === 0) {
        return { error: 'No approvals selected.' };
    }

    const { error } = await supabase
        .from('approvals')
        .delete()
        .in('id', approvalIds);

    if (error) {
        console.error('Error rejecting multiple requests:', error);
        return { error: `Failed to reject requests: ${error.message}` };
    }

    revalidatePath('/dashboard/approvals');
    return { success: true, message: `${approvalIds.length} request(s) rejected.` };
}
