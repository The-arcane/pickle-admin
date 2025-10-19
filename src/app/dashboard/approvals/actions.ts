
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

    // Step 1: Find the 'member' role ID.
    const { data: roleData, error: roleError } = await supabase
        .from('organisation_roles')
        .select('id')
        .eq('name', 'member')
        .single();
    
    if (roleError || !roleData) {
        console.error('Error finding member role:', roleError);
        return { error: "System configuration error: 'member' role not found." };
    }
    const memberRoleId = roleData.id;

    // Step 2: Add the user to the user_organisations table.
    // Using upsert to prevent errors if a relationship somehow already exists.
    const { error: userOrgError } = await supabase
        .from('user_organisations')
        .upsert({
            user_id: userId,
            organisation_id: organisationId,
            role_id: memberRoleId,
        }, { onConflict: 'user_id, organisation_id' });

    if (userOrgError) {
        console.error('Error adding user to organization:', userOrgError);
        return { error: `Failed to link user to organization: ${userOrgError.message}` };
    }

    // Step 3: Delete the approval request as it's now been processed.
    const { error: approvalDeleteError } = await supabase
        .from('approvals')
        .delete()
        .eq('id', approvalId);

    if (approvalDeleteError) {
        console.error('Error deleting approval request:', approvalDeleteError);
        // This isn't a critical failure, as the main action (linking user) succeeded.
        // We can log this and proceed.
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
    
    // Find the 'member' role ID once.
    const { data: roleData, error: roleError } = await supabase
        .from('organisation_roles')
        .select('id')
        .eq('name', 'member')
        .single();
    
    if (roleError || !roleData) {
        console.error('Error finding member role:', roleError);
        return { error: "System configuration error: 'member' role not found." };
    }
    const memberRoleId = roleData.id;

    const userOrgInserts = approvals.map(approval => ({
        user_id: approval.userId,
        organisation_id: approval.organisationId,
        role_id: memberRoleId,
    }));
    
    // Step 1: Bulk add users to the user_organisations table.
    const { error: userOrgError } = await supabase
        .from('user_organisations')
        .upsert(userOrgInserts, { onConflict: 'user_id, organisation_id' });
    
    if (userOrgError) {
        console.error('Bulk approve: Error adding users to organization:', userOrgError);
        // Partial success is hard to report here, so we'll report a general failure.
        return { error: `Failed to link users to organization: ${userOrgError.message}` };
    }
    
    // Step 2: Bulk delete the now-processed approval requests.
    const approvalIdsToDelete = approvals.map(a => a.approvalId);
    const { error: approvalDeleteError } = await supabase
        .from('approvals')
        .delete()
        .in('id', approvalIdsToDelete);

    if (approvalDeleteError) {
        console.error(`Bulk approve: Error deleting approvals`, approvalDeleteError);
        // Continue even if this part fails, as the main action succeeded.
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
