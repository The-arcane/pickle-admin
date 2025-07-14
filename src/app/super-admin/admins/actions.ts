
'use server';

import { createServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// This action creates a user with user_type = 2 (Admin) by calling a secure database function.
// This avoids the need for a service role key in the environment.
export async function addAdmin(formData: FormData) {
  const supabase = await createServer();

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;

  if (!email || !name) {
    return { error: "Name and email are required." };
  }

  // Generate a temporary random password. The user will reset this via invitation.
  const password = Math.random().toString(36).slice(-8);

  // 1. Call the database function to create the user and profile
  const { data, error: rpcError } = await supabase.rpc('create_admin_user', {
    email,
    password,
    name,
    phone,
  });

  if (rpcError) {
    console.error("Error calling create_admin_user RPC:", rpcError);
    return { error: `Failed to create admin: ${rpcError.message}` };
  }
  
  // 2. Send invitation email so the user can set their actual password
  const { error: inviteError } = await (await createServer(true)).auth.admin.inviteUserByEmail(email);

  if (inviteError) {
      console.error("Error sending invite email:", inviteError);
      // Don't fail the whole process, but notify the super admin
      return { success: true, message: "Admin created, but failed to send invitation email. Please ask them to use the password reset flow." };
  }

  revalidatePath('/super-admin/admins');
  
  return { success: true, message: "Admin successfully created. You can now assign them as an owner to an organization." };
}

// removeAdmin still requires the service role key to delete a user from auth schema.
export async function removeAdmin(formData: FormData) {
    const supabase = await createServer(true); // Must use service role for deletion

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
