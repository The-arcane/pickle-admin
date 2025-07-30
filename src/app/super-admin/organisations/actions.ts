
'use server';

import { createServiceRoleServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Helper for logo upload
async function handleLogoUpload(supabase: any, file: File | null, orgId: string): Promise<string | null> {
    if (!file || file.size === 0) {
        return null;
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
  const supabase = createServiceRoleServer();
  
  const name = formData.get('name') as string;
  const address = formData.get('address') as string;
  const userId = formData.get('user_id') as string;
  const logoFile = formData.get('logo') as File | null;

  if (!name || !address || !userId) {
      return { error: 'Name, Address, and Owner are required.' };
  }
  
  try {
    // To prevent conflicts with the trigger, we prepare all data *before* the insert.
    // The trigger 'on_organisation_created' will handle linking the user.
    // We will not upload the logo first in this revised logic, as we need an org ID.
    // The core fix is to ensure the insert is simple and the service role is used.

    const insertData: { name: string; address: string; user_id: number; logo?: string } = {
        name,
        address,
        user_id: Number(userId),
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

    // 2. If a logo is provided, upload it and then UPDATE the record.
    // This separates the trigger-firing action from the secondary update.
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
                    toast({
                        variant: 'destructive',
                        title: 'Warning',
                        description: `Organization created, but failed to save logo: ${updateError.message}`,
                    });
            }
        }
    }
  
  } catch(e: any) {
      return { error: `An unexpected error occurred: ${e.message}`};
  }
  
  revalidatePath('/super-admin/organisations');
  return { success: true };
}


export async function updateOrganization(formData: FormData) {
    const supabase = createServiceRoleServer();
    const id = formData.get('id') as string;

    const name = formData.get('name') as string;
    const address = formData.get('address') as string;
    const userId = formData.get('user_id') as string;
    const logoFile = formData.get('logo') as File | null;

    if (!id || !name || !address || !userId) {
        return { error: 'ID, Name, Address, and Owner are required.' };
    }

    const updateData: { name: string; address: string; user_id: number; logo?: string } = {
        name,
        address,
        user_id: Number(userId),
    };
    
    // Upload new logo if provided
    if (logoFile && logoFile.size > 0) {
        try {
            const logoUrl = await handleLogoUpload(supabase, logoFile, id);
            if (logoUrl) {
                updateData.logo = logoUrl;
            }
        } catch(e: any) {
             return { error: e.message };
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

    revalidatePath('/super-admin/organisations');
    return { success: true };
}

export async function deleteOrganization(formData: FormData) {
    const supabase = createServiceRoleServer();
    const id = formData.get('id') as string;

    if (!id) {
        return { error: 'Organization ID is missing.' };
    }
    // Note: To be fully robust, this should also handle deleting the logo from storage.
    // For now, we'll just delete the DB record.

    const { error } = await supabase.from('organisations').delete().eq('id', id);
    if(error) {
         console.error('Error deleting organization:', error);
        return { error: `Failed to delete organization: ${error.message}` };
    }
    
    revalidatePath('/super-admin/organisations');
    return { success: true };
}
