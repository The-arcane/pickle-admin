
'use server';

import { createServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import Papa from 'papaparse';

// This action handles inviting new residents in bulk from a CSV file.
export async function inviteResidents(formData: FormData) {
  const supabase = createServer();

  // 1. Get current user to set as 'invited_by'
  const { data: { user: inviter } } = await supabase.auth.getUser();
  if (!inviter) {
    return { error: 'You must be logged in to invite residents.' };
  }
  const { data: inviterProfile } = await supabase.from('user').select('id').eq('user_uuid', inviter.id).single();
  if (!inviterProfile) {
    return { error: 'Could not find your user profile.' };
  }
  const invited_by = inviterProfile.id;

  // 2. Get data from form
  const csvFile = formData.get('csv_file') as File | null;
  const organisation_id = Number(formData.get('organisation_id'));

  if (!csvFile || csvFile.size === 0) {
    return { error: 'A CSV file is required.' };
  }
  if (!organisation_id) {
    return { error: 'Organization ID is required.' };
  }
  
  // 3. Process CSV file
  let residentsDataFromCsv: { Name: string; email: string; phone: string | null; }[] = [];
  try {
    const fileContent = await csvFile.text();
    const parsed = Papa.parse(fileContent, { header: true, skipEmptyLines: true });
    
    // Check for required headers
    const requiredHeaders = ['Name', 'email'];
    const hasRequiredHeaders = requiredHeaders.every(h => parsed.meta.fields?.map(f => f.toLowerCase()).includes(h.toLowerCase()));

    if (!hasRequiredHeaders) {
        return { error: "CSV file must contain 'Name' and 'email' columns. 'phone' is optional." };
    }
    
    // Find the actual header names, case-insensitively
    const nameHeader = parsed.meta.fields?.find(f => f.toLowerCase() === 'name') || 'Name';
    const emailHeader = parsed.meta.fields?.find(f => f.toLowerCase() === 'email') || 'email';
    const phoneHeader = parsed.meta.fields?.find(f => f.toLowerCase() === 'phone') || 'phone';

    // Parse data and filter for valid rows (must have name and a valid email)
    residentsDataFromCsv = parsed.data
        .map((row: any) => ({
            Name: row[nameHeader]?.trim(),
            email: row[emailHeader]?.trim(),
            phone: row[phoneHeader] ? String(row[phoneHeader]).replace(/\s/g, '') : null
        }))
        .filter(r => r.Name && r.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email));

  } catch(e) {
      console.error("Error parsing CSV:", e);
      return { error: "Failed to parse the CSV file." };
  }

  if (residentsDataFromCsv.length === 0) {
    return { error: 'No valid resident data with Name and email found in the uploaded file.' };
  }

  // 4. Find which emails from the CSV already exist for this organization.
  const emailsFromCsv = residentsDataFromCsv.map(r => r.email);

  const { data: existingInvites, error: fetchError } = await supabase
    .from('residences')
    .select('email')
    .eq('organisation_id', organisation_id)
    .in('email', emailsFromCsv);
  
  if (fetchError) {
    console.error("Error fetching existing data:", {fetchError});
    return { error: 'Could not check for existing invitations.' };
  }

  const existingEmailsForOrg = new Set(existingInvites.map(i => i.email));

  // 5. Prepare residence records for NEW invites only.
  const residencesToInsert = residentsDataFromCsv
    .filter(resident => !existingEmailsForOrg.has(resident.email!))
    .map(resident => ({
        organisation_id,
        invited_by,
        status: 'invited',
        "Name": resident.Name,
        email: resident.email,
        phone: resident.phone,
        user_id: null
    }));
    
  let successCount = 0;
  if (residencesToInsert.length > 0) {
    const { error: insertError, data: insertedData } = await supabase
      .from('residences')
      .insert(residencesToInsert)
      .select();

    if (insertError) {
        console.error("Error inserting residences:", insertError);
        return { error: `An unexpected error occurred during invitations: ${insertError.message}.` };
    }
    successCount = insertedData?.length ?? 0;
  }
  
  // 6. Build a clear summary message for the user.
  const skippedCount = residentsDataFromCsv.length - successCount;

  let message = `Processed ${residentsDataFromCsv.length} records.`;
  if (successCount > 0) {
    message += ` ${successCount} new resident(s) were successfully invited.`;
  }

  if (skippedCount > 0) {
    message += ` Skipped ${skippedCount} who were already invited to this organization.`;
  }
  
  if (successCount === 0 && residentsDataFromCsv.length > 0) {
    message = "No new residents were invited. All users from the CSV were already part of this organization.";
  }


  // 7. Revalidate paths and return summary
  revalidatePath('/dashboard/residences');
  revalidatePath('/super-admin/residences');
  
  return { 
    success: true,
    message
  };
}


export async function removeResidence(formData: FormData) {
    const supabase = await createServer();
    const id = formData.get('id') as string;

    if (!id) {
        return { error: 'Residence ID is required.' };
    }

    const { error } = await supabase.from('residences').delete().eq('id', Number(id));

    if (error) {
        console.error("Error removing residence:", error);
        return { error: "Failed to remove resident." };
    }
    
    revalidatePath('/dashboard/residences');
    revalidatePath('/super-admin/residences');

    return { success: true, message: "Resident removed successfully." };
}
