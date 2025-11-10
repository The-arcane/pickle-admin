
'use server';

import { createServiceRoleServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

const MAX_FILE_SIZE_MB = 2;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// Helper for logo upload
async function handleLogoUpload(supabase: any, file: File | null, orgId: string): Promise<string | null> {
    if (!file || file.size === 0) {
        return null;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
        throw new Error(`File size cannot exceed ${MAX_FILE_SIZE_MB}MB.`);
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `logo-${Date.now()}.${fileExt}`;
    // Store logos in a public folder, organized by organization ID
    const filePath = `public/${orgId}/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
        .from('organisation-logos')
        .upload(filePath, file);

    if (uploadError) {
        console.error(`Error uploading logo:`, uploadError);
        throw new Error(`Upload failed for ${file.name}: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabase.storage
        .from('organisation-logos')
        .getPublicUrl(filePath);
    
    return publicUrlData.publicUrl;
}


export async function addOrganization(formData: FormData) {
  const supabase = await createServiceRoleServer();
  
  const name = formData.get('name') as string;
  const address = formData.get('address') as string;
  const userId = formData.get('user_id') as string;
  const logoFile = formData.get('logo') as File | null;
  const type = Number(formData.get('type'));

  if (!name || !address || !userId || !type) {
      return { error: 'Name, Address, Owner, and Type are required.' };
  }
  
  try {
    const insertData: { name: string; address: string; user_id: number; logo?: string, is_active: boolean, type: number } = {
        name,
        address,
        user_id: Number(userId),
        is_active: false,
        type: type,
    };

    // 1. Insert the organization record. This will fire the trigger.
    const { data: newOrg, error: orgInsertError } = await supabase
        .from('organisations')
        .insert(insertData)
        .select()
        .single();
    
    if (orgInsertError) {
        console.error('Error creating organization:', orgInsertError);
        if (orgInsertError.message.includes('violates foreign key constraint')) {
            return { error: 'The selected user does not exist or cannot be assigned as an owner.' };
        }
        if (orgInsertError.message.includes('user_organisations_user_id_key') || orgInsertError.message.includes('already an admin')) {
            return { error: 'This user is already an admin of another organization.' };
        }
        return { error: `Failed to create organization: ${orgInsertError.message}` };
    }

    if (!newOrg) {
        return { error: 'Failed to create organization. No data was returned after insert.' };
    }
    
    let userTypeToSet: number | null = null;
    if (type === 4) { // Arena
      userTypeToSet = 9; // Arena Admin
    } else if (type === 1) { // Living Space
      userTypeToSet = 2; // Living Space Admin
    }

    if (userTypeToSet) {
        const { error: userUpdateError } = await supabase
            .from('user')
            .update({ user_type: userTypeToSet })
            .eq('id', Number(userId));

        if (userUpdateError) {
            console.error(`Error updating user type to ${userTypeToSet}:`, userUpdateError);
            // Rollback the organization creation
            await supabase.from('organisations').delete().eq('id', newOrg.id);
            return { error: `Failed to assign admin role. Organization creation was rolled back.` };
        }
    }


    // 2. If a logo is provided, upload it and then UPDATE the record.
    if (logoFile && logoFile.size > 0) {
        const logoUrl = await handleLogoUpload(supabase, logoFile, newOrg.id.toString());
        if (logoUrl) {
            const { error: updateError } = await supabase
                .from('organisations')
                .update({ logo: logoUrl })
                .eq('id', newOrg.id);

            if (updateError) {
                 // Non-fatal error, the org was created.
                 console.error('Error updating org with logo:', updateError);
                 return { error: `Organization created, but failed to save logo: ${updateError.message}` };
            }
        }
    }
  
  } catch(e: any) {
      return { error: `An unexpected error occurred: ${e.message}`};
  }
  
  revalidatePath('/super-admin/organisations');
  revalidatePath('/super-admin/arena');
  return { success: true };
}


export async function updateOrganization(formData: FormData) {
    const supabase = await createServiceRoleServer();
    const id = formData.get('id') as string;

    const name = formData.get('name') as string;
    const address = formData.get('address') as string;
    const userId = formData.get('user_id') as string;
    const logoFile = formData.get('logo') as File | null;
    const type = Number(formData.get('type'));

    if (!id || !name || !address || !userId || !type) {
        return { error: 'ID, Name, Address, Owner, and Type are required.' };
    }
    try {
        const updateData: { name: string; address: string; user_id: number; logo?: string; type: number; } = {
            name,
            address,
            user_id: Number(userId),
            type: type,
        };
        
        // Upload new logo if provided
        if (logoFile && logoFile.size > 0) {
            const logoUrl = await handleLogoUpload(supabase, logoFile, id);
            if (logoUrl) {
                updateData.logo = logoUrl;
            }
        }

        const { error } = await supabase
            .from('organisations')
            .update(updateData)
            .eq('id', id);

        if (error) {
            console.error('Error updating organization:', error);
            // Provide a more user-friendly error message
            if (error.message.includes('user_organisations_user_id_key')) {
                return { error: 'This user is already an admin of another organization.' };
            }
            return { error: `Failed to update organization: ${error.message}` };
        }
    } catch(e: any) {
        return { error: `An unexpected error occurred: ${e.message}`};
    }


    revalidatePath('/super-admin/organisations');
    return { success: true };
}

export async function toggleOrganizationStatus(formData: FormData) {
    const supabase = createServiceRoleServer();
    const id = formData.get('id') as string;
    const currentStatus = formData.get('is_active') === 'true';

    if (!id) {
        return { error: 'Organization ID is missing.' };
    }

    const { error } = await supabase
        .from('organisations')
        .update({ is_active: !currentStatus })
        .eq('id', id);

    if (error) {
        console.error('Error updating organization status:', error);
        return { error: `Failed to update status: ${error.message}` };
    }

    revalidatePath('/super-admin/organisations');
    return { success: true, message: `Organization status updated to ${!currentStatus ? 'Active' : 'Inactive'}.` };
}

