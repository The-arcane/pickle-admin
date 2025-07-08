'use server';

import { createServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// This action handles inviting new residents in bulk.
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
  const rawEmails = formData.get('emails') as string;
  const organisation_id = Number(formData.get('organisation_id'));

  if (!rawEmails || !organisation_id) {
    return { error: 'Emails and organization ID are required.' };
  }

  // 3. Process emails
  const emails = rawEmails.split(/[\n,;]+/).map(email => email.trim()).filter(email => email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
  if (emails.length === 0) {
    return { error: 'No valid emails provided.' };
  }

  let successCount = 0;
  let duplicateCount = 0;
  let errorCount = 0;

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
    // Use ON CONFLICT to ignore duplicates
    const { error: insertError, count } = await supabase
      .from('residences')
      .insert(residencesToInsert)
      .select({ count: 'exact' });
    
    if(insertError) {
      console.error("Error inserting residences:", insertError);
      errorCount = emails.length - (count ?? 0);
    }

    successCount = count ?? 0;
  }
  
  duplicateCount = emails.length - successCount - errorCount;

  // 6. Revalidate paths and return summary
  revalidatePath('/dashboard/residences');
  revalidatePath('/super-admin/residences');
  
  return { 
    success: true,
    message: `Invited ${successCount} new residents. ${duplicateCount} were already members. ${errorCount} failed.` 
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
