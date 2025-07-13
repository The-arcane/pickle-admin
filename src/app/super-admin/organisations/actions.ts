'use server';

import { createServer } from '@/lib/supabase/server';
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
  const supabase = await createServer();
  
  const name = formData.get('name') as string;
  const address = formData.get('address') as string;
  const userId = formData.get('user_id') as string;
  const logoFile = formData.get('logo') as File | null;

  if (!name || !address || !userId) {
      return { error: 'Name, Address, and Owner are required.' };
  }

  // 1. Insert org record without logo
  const { data: newOrg, error: insertError } = await supabase
    .from('organisations')
    .insert({ name, address, user_id: Number(userId) })
    .select()
    .single();

  if (insertError || !newOrg) {
    console.error('Error adding organization:', insertError);
    return { error: `Failed to add organization: ${insertError?.message}` };
  }

  // 2. Upload logo and update record
  if (logoFile && logoFile.size > 0) {
    try {
        const logoUrl = await handleLogoUpload(supabase, logoFile, newOrg.id.toString());
        if (logoUrl) {
            const { error: updateError } = await supabase
                .from('organisations')
                .update({ logo: logoUrl })
                .eq('id', newOrg.id);

            if (updateError) {
                 return { error: `Organization added, but failed to save logo: ${updateError.message}` };
            }
        }
    } catch(e: any) {
        return { error: e.message };
    }
  }

  revalidatePath('/super-admin/organisations');
  return { success: true };
}


export async function updateOrganization(formData: FormData) {
    const supabase = await createServer();
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
        return { error: `Failed to update organization: ${error.message}` };
    }

    revalidatePath('/super-admin/organisations');
    return { success: true };
}

export async function deleteOrganization(formData: FormData) {
    const supabase = await createServer();
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
