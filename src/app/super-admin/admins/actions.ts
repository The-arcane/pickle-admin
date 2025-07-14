
'use server';

import { createServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// This action creates a user with user_type = 2 (Admin) but does not link them to an organization.
// The linking is handled by the trigger on the organisations table when an owner is assigned.
export async function addAdmin(formData: FormData) {
  const supabase = await createServer(true);

  // The createServer function now returns the client or an error object if keys are missing
  if ('error' in supabase) {
      return { error: supabase.error };
  }

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;

  if (!email || !name) {
    return { error: "Name and email are required." };
  }

  const password = Math.random().toString(36).slice(-8);

  // 1. Create the user in Supabase Auth
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  
  if (authError) {
      console.error("Error creating auth user:", authError);
      return { error: `Failed to create user: ${authError.message}` };
  }
  if (!authUser.user) {
      return { error: 'Could not create user account.' };
  }

  // 2. Insert into public.user table with user_type 2 (Admin)
  const { error: profileError } = await supabase
    .from('user')
    .insert({
        user_uuid: authUser.user.id,
        name,
        email,
        phone,
        user_type: 2, // 2 for Admin
    });

  if (profileError) {
      console.error("Error creating user profile:", profileError);
      // If profile creation fails, we should delete the auth user to avoid orphans
      await supabase.auth.admin.deleteUser(authUser.user.id);
      return { error: `Failed to create user profile: ${profileError.message}` };
  }

  // 3. Send invitation email
  const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email);
  if (inviteError) {
      console.error("Error sending invite email:", inviteError);
      // Don't fail the whole process, but notify the super admin
      return { success: true, message: "Admin created, but failed to send invitation email. Please ask them to use the password reset flow." };
  }

  revalidatePath('/super-admin/admins');
  
  return { success: true, message: "Admin successfully created. You can now assign them as an owner to an organization." };
}

// This is identical to removeEmployee
export async function removeAdmin(formData: FormData) {
    const supabase = await createServer(true);

    if ('error' in supabase) {
        return { error: supabase.error };
    }

    const userId = formData.get('user_id') as string;

    if (!userId) {
        return { error: 'User ID is required.' };
    }

    const { data: user } = await supabase.from('user').select('user_uuid').eq('id', userId).single();
    if (!user) {
        return { error: 'User not found.' };
    }
    
    // Deleting the auth user will cascade and delete the public user and user_organisations link
    const { error } = await supabase.auth.admin.deleteUser(user.user_uuid);

    if (error) {
        console.error("Error removing admin:", error);
        return { error: `Failed to remove admin: ${error.message}` };
    }
    
    revalidatePath('/super-admin/admins');

    return { success: true, message: "Admin removed successfully." };
}
