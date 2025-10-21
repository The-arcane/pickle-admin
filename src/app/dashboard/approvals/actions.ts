
'use server';

import { createServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

async function findOrCreateFlat(supabase: any, buildingNumberId: number, flatNumber: string): Promise<number | null> {
    const upperCaseFlatNumber = flatNumber.toUpperCase().replace(/\s+/g, '');

    // Check if flat already exists
    let { data: existingFlat, error: findError } = await supabase
        .from('flats')
        .select('id')
        .eq('building_number_id', buildingNumberId)
        .eq('flat_number', upperCaseFlatNumber)
        .maybeSingle();

    if (findError) {
        console.error("Error finding flat:", findError);
        return null;
    }

    if (existingFlat) {
        return existingFlat.id;
    }

    // If not, create it
    const { data: newFlatData, error: createError } = await supabase
        .from('flats')
        .insert({
            building_number_id: buildingNumberId,
            flat_number: upperCaseFlatNumber,
        })
        .select('id')
        .single();
    
    if (createError) {
        console.error("Error creating flat:", createError);
        return null;
    }
    
    if (!newFlatData) {
        console.error("Flat creation did not return the expected record.");
        return null;
    }

    return newFlatData.id;
}


export async function approveRequest(formData: FormData) {
    const supabase = await createServer();
    const approvalId = Number(formData.get('approval_id'));
    const userId = Number(formData.get('user_id'));
    const organisationId = Number(formData.get('organisation_id'));
    const buildingNumberId = formData.get('building_number_id') ? Number(formData.get('building_number_id')) : null;
    const flatNumber = formData.get('flat') as string | null;

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

    // Step 2: Find or create the flat if details are provided
    let flatId = null;
    if (buildingNumberId && flatNumber) {
        flatId = await findOrCreateFlat(supabase, buildingNumberId, flatNumber);
        if (!flatId) {
            return { error: 'Could not find or create the specified flat.' };
        }
    }

    // Step 3: Add the user to the user_organisations table with the flat_id
    const userOrgPayload = {
        user_id: userId,
        organisation_id: organisationId,
        role_id: memberRoleId,
        flat_id: flatId,
        building_number_id: null, 
    };

    const { error: userOrgError } = await supabase
        .from('user_organisations')
        .insert(userOrgPayload); 

    if (userOrgError) {
        console.error('Error adding user to organization:', userOrgError);
        return { error: `Failed to link user to organization: ${userOrgError.message}` };
    }

    // Step 4: Delete the approval request as it's now been processed.
    const { error: approvalDeleteError } = await supabase
        .from('approvals')
        .delete()
        .eq('id', approvalId);

    if (approvalDeleteError) {
        console.error('Error deleting approval request:', approvalDeleteError);
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


// --- Bulk Actions ---

type ApprovalInfo = { 
    approvalId: number; 
    userId: number; 
    organisationId: number;
    buildingNumberId: number | null;
    flat: string | null;
};

export async function approveMultipleRequests(approvals: ApprovalInfo[]) {
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

    // Process each approval: find/create flat, then create payload for user_org insert
    const userOrgInserts = [];
    for (const approval of approvals) {
        let flatId = null;
        if (approval.buildingNumberId && approval.flat) {
            flatId = await findOrCreateFlat(supabase, approval.buildingNumberId, approval.flat);
            if (!flatId) {
                console.error(`Could not process flat for approval ID ${approval.approvalId}. Skipping.`);
                continue;
            }
        }

        userOrgInserts.push({
            user_id: approval.userId,
            organisation_id: approval.organisationId,
            role_id: memberRoleId,
            flat_id: flatId,
            building_number_id: null,
        });
    }

    if (userOrgInserts.length === 0) {
        return { error: 'Could not process any of the selected approvals due to flat assignment errors.' };
    }
    
    // Step 1: Bulk add users to the user_organisations table.
    const { error: userOrgError } = await supabase
        .from('user_organisations')
        .insert(userOrgInserts);
    
    if (userOrgError) {
        console.error('Bulk approve: Error adding users to organization:', userOrgError);
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
    }
    
    revalidatePath('/dashboard/approvals');
    revalidatePath('/dashboard/users');

    return { success: true, message: `${userOrgInserts.length} request(s) processed.` };
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

export async function getFlatsForWing(buildingNumberId: number) {
    const supabase = await createServer();
    const { data, error } = await supabase
        .from('flats')
        .select('id, flat_number')
        .eq('building_number_id', buildingNumberId)
        .order('flat_number', { ascending: true });
    
    if (error) {
        console.error("Error fetching flats for wing:", error);
        return [];
    }
    
    return data;
}
