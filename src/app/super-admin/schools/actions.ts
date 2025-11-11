

'use server';

import { revalidatePath } from 'next/cache';
import { createServiceRoleServer } from '@/lib/supabase/server';
import Papa from 'papaparse';

export async function removeSchool(formData: FormData) {
    const supabaseAdmin = await createServiceRoleServer();
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
  const supabase = await createServiceRoleServer();
  const assignedUserId = 86; // The hardcoded user ID

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

  let schoolsToInsert: { name: string; address: string; type: number; is_active: boolean; user_id: number; }[] = [];
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
            user_id: assignedUserId, // Assign the hardcoded user ID here
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
