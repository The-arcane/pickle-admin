
'use server';

import { revalidatePath } from 'next/cache';
import { createServiceRoleServer } from '@/lib/supabase/server';
import Papa from 'papaparse';

export async function addSchool(formData: FormData) {
  const supabaseAdmin = createServiceRoleServer();

  // --- Admin User Data ---
  const adminName = formData.get('admin_name') as string;
  const adminEmail = formData.get('admin_email') as string;
  const adminPassword = formData.get('admin_password') as string;

  // --- Organization Data ---
  const orgName = formData.get('org_name') as string;
  const orgAddress = formData.get('org_address') as string;
  const orgTypeId = formData.get('org_type_id') as string;
  
  // Validation
  if (!adminName || !adminEmail || !adminPassword || !orgName || !orgAddress || !orgTypeId) {
    return { error: "All fields are required to create a new school and its admin." };
  }

  // 1. Create the admin user in Supabase Auth first.
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
    user_metadata: { name: adminName },
  });
  
  if (authError || !authData.user) {
      console.error("Error creating school admin auth user:", authError);
      return { error: `Failed to create auth user: ${authError?.message}` };
  }

  // 2. Update the user profile created by the trigger.
  const { data: adminProfile, error: profileError } = await supabaseAdmin
    .from('user')
    .update({
        user_type: 2, // Set user_type to 2 for Admin
        name: adminName,
    })
    .eq('user_uuid', authData.user.id)
    .select('id')
    .single();
  
  if (profileError || !adminProfile) {
      console.error("Error updating user profile for school admin:", profileError);
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return { error: `Failed to set user profile as Admin: ${profileError.message}` };
  }
  const newAdminId = adminProfile.id;

  // 3. Create the organization and link the new admin user.
  const { error: orgInsertError } = await supabaseAdmin
    .from('organisations')
    .insert({
        name: orgName,
        address: orgAddress,
        user_id: newAdminId,
        "type": Number(orgTypeId),
        is_active: true, // Schools are active by default
    });
    
  if (orgInsertError) {
      console.error('Error creating school organization:', orgInsertError);
      // Clean up the created auth user and profile if org creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id); 
      return { error: `Failed to create school organization: ${orgInsertError.message}` };
  }
  
  revalidatePath('/super-admin/schools');
  return { success: true, message: "School and admin created successfully." };
}

export async function removeSchool(formData: FormData) {
    const supabaseAdmin = createServiceRoleServer();
    const orgId = formData.get('org_id') as string;

    if (!orgId) {
        return { error: 'Organization ID is required.' };
    }

    // Deleting an organization will cascade delete the user link, but not the user itself.
    // For a full cleanup, we should also delete the admin user associated with it if they only belong to this org.
    // This is a simplified version for now.
    const { error } = await supabaseAdmin.from('organisations').delete().eq('id', Number(orgId));

    if (error) {
        console.error("Error removing school:", error);
        return { error: "Failed to remove school." };
    }
    
    revalidatePath('/super-admin/schools');
    return { success: true, message: "School removed successfully." };
}

export async function importSchoolsFromCSV(formData: FormData) {
  const supabase = createServiceRoleServer();

  const csvFile = formData.get('csv_file') as File | null;
  if (!csvFile || csvFile.size === 0) {
    return { error: 'A CSV file is required.' };
  }

  // Find the ID for the 'education' organization type
  const { data: educationType, error: typeError } = await supabase
    .from('organisation_types')
    .select('id')
    .eq('type_name', 'education')
    .single();

  if (typeError || !educationType) {
      return { error: "Could not find 'education' organization type in the database." };
  }

  let schoolsToInsert: { name: string; address: string; type: number; is_active: boolean; user_id: null; }[] = [];
  try {
    const fileContent = await csvFile.text();
    const parsed = Papa.parse(fileContent, { header: true, skipEmptyLines: true });

    const requiredHeaders = ['name', 'address'];
    const hasRequiredHeaders = requiredHeaders.every(h => parsed.meta.fields?.map(f => f.toLowerCase()).includes(h.toLowerCase()));

    if (!hasRequiredHeaders) {
        return { error: "CSV file must contain 'name' and 'address' columns." };
    }

    const nameHeader = parsed.meta.fields?.find(f => f.toLowerCase() === 'name') || 'name';
    const addressHeader = parsed.meta.fields?.find(f => f.toLowerCase() === 'address') || 'address';

    schoolsToInsert = parsed.data
        .map((row: any) => ({
            name: row[nameHeader]?.trim(),
            address: row[addressHeader]?.trim(),
            type: educationType.id,
            is_active: true,
            user_id: null,
        }))
        .filter(s => s.name && s.address);

  } catch(e) {
      console.error("Error parsing CSV:", e);
      return { error: "Failed to parse the CSV file." };
  }

  if (schoolsToInsert.length === 0) {
    return { error: 'No valid school data with name and address found in the uploaded file.' };
  }

  const { error: insertError, data: insertedData } = await supabase
    .from('organisations')
    .insert(schoolsToInsert)
    .select();

  if (insertError) {
      console.error("Error inserting schools:", insertError);
      return { error: `An unexpected error occurred during import: ${insertError.message}.` };
  }

  revalidatePath('/super-admin/schools');
  return { 
    success: true,
    message: `Successfully imported ${insertedData?.length ?? 0} new schools.`
  };
}
