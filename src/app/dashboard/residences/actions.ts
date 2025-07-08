
'use server';

import { createServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import Papa from 'papaparse';
import crypto from 'crypto';

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
    
    const requiredHeaders = ['Name', 'email', 'phone'];
    const hasRequiredHeaders = requiredHeaders.every(h => parsed.meta.fields?.map(f => f.toLowerCase()).includes(h.toLowerCase()));

    if (!hasRequiredHeaders) {
        return { error: "CSV file must contain 'Name', 'email', and 'phone' columns." };
    }
    
    const nameHeader = parsed.meta.fields?.find(f => f.toLowerCase() === 'name') || 'Name';
    const emailHeader = parsed.meta.fields?.find(f => f.toLowerCase() === 'email') || 'email';
    const phoneHeader = parsed.meta.fields?.find(f => f.toLowerCase() === 'phone') || 'phone';

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

  // 4. Find existing users and identify new users to create
  const emailsToProcess = residentsDataFromCsv.map(r => r.email);
  const { data: existingUsers, error: fetchUsersError } = await supabase
    .from('user')
    .select('id, email')
    .in('email', emailsToProcess);

  if (fetchUsersError) {
    console.error("Error fetching existing users:", fetchUsersError);
    return { error: 'Could not check for existing users.' };
  }
  
  const existingUserMap = new Map(existingUsers.map(u => [u.email, u.id]));
  const usersToCreate = residentsDataFromCsv.filter(r => !existingUserMap.has(r.email));
  let newlyCreatedUserMap = new Map<string, number>();

  if (usersToCreate.length > 0) {
      const newUserRecords = usersToCreate.map(user => ({
          name: user.Name,
          email: user.email,
          phone: user.phone?.toString(),
          username: user.email,
          hashed_password: crypto.randomBytes(32).toString('hex'), 
          user_type: 1, // Default to a standard user type
          profile_image_url: 'https://placehold.co/128x128.png', // Placeholder to satisfy not-null constraint
      }));

      const { data: insertedUsers, error: insertError } = await supabase
        .from('user')
        .insert(newUserRecords)
        .select('id, email');
    
      if (insertError) {
          console.error("Error inserting new users:", insertError);
          return { error: `Failed to create new user accounts. DB Error: ${insertError.message}` };
      }
      newlyCreatedUserMap = new Map(insertedUsers.map(u => [u.email, u.id]));
  }

  const allUserIdsMap = new Map([...existingUserMap, ...newlyCreatedUserMap]);

  // 5. Prepare residence invitations for all users (newly created and existing)
  const residencesToInsert = residentsDataFromCsv
    .map(r => {
        const userId = allUserIdsMap.get(r.email);
        if (!userId) return null; // Skip if user doesn't exist and creation failed

        return {
            organisation_id,
            user_id: userId,
            invited_by,
            status: 'invited',
            "Name": r.Name,
            email: r.email,
            phone: r.phone
        };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);
    
  let successCount = 0;
  if (residencesToInsert.length > 0) {
    const { error: upsertError, count } = await supabase
      .from('residences')
      .upsert(residencesToInsert, { onConflict: 'organisation_id,user_id', ignoreDuplicates: true })
      .select({ count: 'exact' });

    if (upsertError) {
        console.error("Error upserting residences:", upsertError);
        return { error: `An unexpected error occurred during invitations: ${upsertError.message}` };
    }
    successCount = count ?? 0;
  }
  
  const alreadyInvitedCount = residencesToInsert.length - successCount;
  
  let message = `Processed ${residentsDataFromCsv.length} records. Created ${usersToCreate.length} new user(s). Invited ${successCount} new residents.`;
  if (alreadyInvitedCount > 0) {
      message += ` ${alreadyInvitedCount} were already members.`;
  }

  // 6. Revalidate paths and return summary
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
