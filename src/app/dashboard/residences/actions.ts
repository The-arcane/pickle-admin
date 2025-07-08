
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
  let residentsDataFromCsv: { Name: string; email: string; phone: number | null; }[] = [];
  try {
    const fileContent = await csvFile.text();
    const parsed = Papa.parse(fileContent, { header: true, skipEmptyLines: true });
    
    // Check for required headers
    const requiredHeaders = ['Name', 'email', 'phone'];
    const hasRequiredHeaders = requiredHeaders.every(h => parsed.meta.fields?.map(f => f.toLowerCase()).includes(h.toLowerCase()));

    if (!hasRequiredHeaders) {
        return { error: "CSV file must contain 'Name', 'email', and 'phone' columns." };
    }
    
    // Find the actual header names, case-insensitively
    const nameHeader = parsed.meta.fields?.find(f => f.toLowerCase() === 'name') || 'Name';
    const emailHeader = parsed.meta.fields?.find(f => f.toLowerCase() === 'email') || 'email';
    const phoneHeader = parsed.meta.fields?.find(f => f.toLowerCase() === 'phone') || 'phone';

    // Parse data and filter for valid rows
    residentsDataFromCsv = parsed.data
        .map((row: any) => ({
            Name: row[nameHeader]?.trim(),
            email: row[emailHeader]?.trim(),
            phone: row[phoneHeader] ? Number(String(row[phoneHeader]).replace(/\s/g, '')) : null
        }))
        .filter(r => r.Name && r.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email));

  } catch(e) {
      console.error("Error parsing CSV:", e);
      return { error: "Failed to parse the CSV file." };
  }

  if (residentsDataFromCsv.length === 0) {
    return { error: 'No valid resident data with Name and email found in the uploaded file.' };
  }

  // 4. Find which users from the CSV already exist in the system.
  const emailsFromCsv = residentsDataFromCsv.map(r => r.email);
  const { data: existingUsers, error: fetchUsersError } = await supabase
    .from('user')
    .select('id, email')
    .in('email', emailsFromCsv);

  if (fetchUsersError) {
    console.error("Error fetching existing users:", fetchUsersError);
    return { error: 'Could not check for existing users.' };
  }
  
  const existingUserMap = new Map(existingUsers.map(u => [u.email, u.id]));
  const skippedEmails: string[] = [];

  // 5. Prepare residence records ONLY for existing users.
  const residencesToInsert = residentsDataFromCsv
    .map(residentFromCsv => {
        const userId = existingUserMap.get(residentFromCsv.email);

        // If the user does not exist in the 'user' table, we cannot create a residence.
        // Skip this record and add the email to a list to report back to the admin.
        if (!userId) {
            skippedEmails.push(residentFromCsv.email);
            return null;
        }

        return {
            organisation_id,
            user_id: userId, // This ID comes from an existing user.
            invited_by,
            status: 'invited',
            "Name": residentFromCsv.Name,
            email: residentFromCsv.email,
            phone: residentFromCsv.phone
        };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);
    
  let successCount = 0;
  if (residencesToInsert.length > 0) {
    const { error: upsertError, count } = await supabase
      .from('residences')
      // Use upsert to gracefully handle cases where a user is already a resident of the org.
      .upsert(residencesToInsert, { onConflict: 'organisation_id,user_id', ignoreDuplicates: true })
      .select({ count: 'exact' });

    if (upsertError) {
        console.error("Error upserting residences:", upsertError);
        return { error: `An unexpected error occurred during invitations: ${upsertError.message}` };
    }
    successCount = count ?? 0;
  }
  
  // 6. Build a clear summary message for the user.
  let message = `Processed ${residentsDataFromCsv.length} records from the CSV.`;
  if (successCount > 0) {
    message += ` ${successCount} resident(s) were successfully invited or already existed.`;
  }
  if (skippedEmails.length > 0) {
    message += ` ${skippedEmails.length} user(s) were skipped because they do not have an account.`;
  }
  if (successCount === 0 && residencesToInsert.length === 0) {
    message = "No new residents were invited. All users from the CSV either do not have an account or are already members.";
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
    const supabase = createServer();
    const id = formData.get('id') as string;

    if (!id) {
        return { error: 'Residence ID is required.' };
    }

    const { error } = await supabase.from('residences').delete().eq('id', Number(id));

    if (error) {
        console.error("Error removing residence:", error);
        return { error: "Failed to remove residence." };
    }
    
    revalidatePath('/dashboard/residences');
    revalidatePath('/super-admin/residences');

    return { success: true, message: "Residence removed successfully." };
}
