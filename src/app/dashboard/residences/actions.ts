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
  let emails: string[] = [];
  try {
    const fileContent = await csvFile.text();
    const parsed = Papa.parse(fileContent, { header: true, skipEmptyLines: true });
    
    // Check for 'email' column, otherwise assume first column
    const emailHeader = parsed.meta.fields?.find(field => field.toLowerCase() === 'email');
    if (!emailHeader && parsed.meta.fields?.length === 0) {
        return { error: "CSV file is empty or has no header." };
    }
    const headerToUse = emailHeader || (parsed.meta.fields ? parsed.meta.fields[0] : null);
    if (!headerToUse) {
        return { error: "Could not determine email column in CSV." };
    }

    emails = parsed.data
        .map((row: any) => row[headerToUse]?.trim())
        .filter(email => email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));

  } catch(e) {
      console.error("Error parsing CSV:", e);
      return { error: "Failed to parse the CSV file." };
  }

  if (emails.length === 0) {
    return { error: 'No valid emails found in the uploaded file.' };
  }

  let successCount = 0;
  let duplicateCount = 0;

  // 4. Find or create users for each email
  const { data: existingUsers, error: fetchUsersError } = await supabase
    .from('user')
    .select('id, email')
    .in('email', emails);

  if (fetchUsersError) {
    console.error("Error fetching existing users:", fetchUsersError);
    return { error: 'Could not check for existing users.' };
  }
  
  const existingUserMap = new Map(existingUsers.map(u => [u.email, u.id]));
  const emailsToCreate = emails.filter(email => !existingUserMap.has(email));
  
  const usersToInsert = emailsToCreate.map(email => ({
    email: email,
    name: email.split('@')[0], // Use a default name
    user_type: 1 // Default to general user
  }));
  
  if (usersToInsert.length > 0) {
      const { data: newUsers, error: createUsersError } = await supabase
        .from('user')
        .insert(usersToInsert)
        .select('id, email');
      
      if (createUsersError) {
          console.error("Error creating new users:", createUsersError);
          return { error: 'Failed to create new user accounts for invites.' };
      }

      newUsers.forEach(u => existingUserMap.set(u.email, u.id));
  }
  
  // 5. Create residence invitations
  const residencesToInsert = emails.map(email => ({
      organisation_id,
      user_id: existingUserMap.get(email)!,
      invited_by,
      status: 'invited'
  })).filter(r => r.user_id);

  if (residencesToInsert.length > 0) {
    // Use upsert with ignoreDuplicates to prevent errors on existing residents
    // and only insert new ones.
    const { error: upsertError, count } = await supabase
      .from('residences')
      .upsert(residencesToInsert, { onConflict: 'organisation_id,user_id', ignoreDuplicates: true })
      .select({ count: 'exact' });

    if (upsertError) {
        // This would be an unexpected error, as conflicts should be ignored.
        console.error("Error upserting residences:", upsertError);
        return { error: `An unexpected error occurred during invitations: ${upsertError.message}` };
    }

    successCount = count ?? 0;
  }
  
  duplicateCount = emails.length - successCount;

  // 6. Revalidate paths and return summary
  revalidatePath('/dashboard/residences');
  revalidatePath('/super-admin/residences');
  
  return { 
    success: true,
    message: `Invited ${successCount} new residents from CSV. ${duplicateCount} were already members.` 
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
