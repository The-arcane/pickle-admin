'use server';

import { revalidatePath } from 'next/cache';
import { createServiceRoleServer } from '@/lib/supabase/server';
import Papa from 'papaparse';

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
        .from('school_logos') // Reusing school_logos bucket for now
        .upload(filePath, file);

    if (uploadError) {
        console.error(`Error uploading logo:`, uploadError);
        throw new Error(`Upload failed for ${file.name}: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabase.storage
        .from('school_logos')
        .getPublicUrl(filePath);
    
    return publicUrlData.publicUrl;
}


export async function addHospitalityOrg(formData: FormData) {
  const supabaseAdmin = createServiceRoleServer();

  // --- Admin User Data ---
  const adminName = formData.get('admin_name') as string;
  const adminEmail = formData.get('admin_email') as string;
  const adminPassword = formData.get('admin_password') as string;

  // --- Organization Data ---
  const orgName = formData.get('org_name') as string;
  const orgAddress = formData.get('org_address') as string;
  const logoFile = formData.get('logo') as File | null;
  
  // Validation
  if (!adminName || !adminEmail || !adminPassword || !orgName || !orgAddress) {
    return { error: "All fields are required to create a new hospitality org and its admin." };
  }
  
  // Get the ID for the 'hospitality' organization type
  const { data: hospitalityType, error: typeError } = await supabaseAdmin
    .from('organisation_types')
    .select('id')
    .eq('type_name', 'hospitality')
    .single();

  if (typeError || !hospitalityType) {
      return { error: "System error: Could not find the 'hospitality' organization type." };
  }

  // 1. Create the admin user in Supabase Auth first.
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
    user_metadata: { name: adminName },
  });
  
  if (authError || !authData.user) {
      console.error("Error creating hospitality admin auth user:", authError);
      return { error: `Failed to create auth user: ${authError?.message}` };
  }

  // 2. Update the user profile created by the trigger.
  const { data: adminProfile, error: profileError } = await supabaseAdmin
    .from('user')
    .update({
        user_type: 8, // Set user_type to 8 for Hospitality Admin
        name: adminName,
    })
    .eq('user_uuid', authData.user.id)
    .select('id')
    .single();
  
  if (profileError || !adminProfile) {
      console.error("Error updating user profile for hospitality admin:", profileError);
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return { error: `Failed to set user profile as Admin: ${profileError.message}` };
  }
  const newAdminId = adminProfile.id;

  // 3. Create the organization (without logo first)
  const { data: newOrg, error: orgInsertError } = await supabaseAdmin
    .from('organisations')
    .insert({
        name: orgName,
        address: orgAddress,
        user_id: newAdminId,
        type: hospitalityType.id, // Use type 3
        is_active: true, // Active by default
    })
    .select('id')
    .single();
    
  if (orgInsertError || !newOrg) {
      console.error('Error creating hospitality organization:', orgInsertError);
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id); 
      return { error: `Failed to create hospitality organization: ${orgInsertError?.message}` };
  }
  
  // 4. Upload logo and update the new organization record
  if (logoFile && logoFile.size > 0) {
      try {
          const logoUrl = await handleLogoUpload(supabaseAdmin, logoFile, newOrg.id.toString());
          if(logoUrl) {
              const { error: logoUpdateError } = await supabaseAdmin
                .from('organisations')
                .update({ logo: logoUrl })
                .eq('id', newOrg.id);
            
              if (logoUpdateError) {
                  return { success: true, message: `Hospitality org and admin created, but failed to save logo: ${logoUpdateError.message}` };
              }
          }
      } catch (e: any) {
           return { success: true, message: `Hospitality org and admin created, but failed to upload logo: ${e.message}` };
      }
  }
  
  revalidatePath('/super-admin/hospitality');
  return { success: true, message: "Hospitality organization and admin created successfully." };
}

export async function removeHospitalityOrg(formData: FormData) {
    const supabaseAdmin = createServiceRoleServer();
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
