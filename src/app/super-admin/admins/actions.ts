
'use server';

import { createServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// This action creates a user with user_type = 2 (Admin) by calling a secure database function.
// This avoids the need for a service role key in the environment for the creation part.
export async function addAdmin(formData: FormData) {
  const supabase = await createServer();

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const password = formData.get('password') as string;

  if (!email || !name || !password) {
    return { error: "Name, email, and password are required." };
  }

  // 1. Call the database function to create the user and profile
  const { error: rpcError } = await supabase.rpc('create_admin_user', {
    email,
    password,
    name,
    phone,
  });

  if (rpcError) {
    console.error("Error calling create_admin_user RPC:", rpcError);
    return { error: `Failed to create admin: ${rpcError.message}` };
  }

  revalidatePath('/super-admin/admins');
  
  return { success: true, message: "Admin user successfully created." };
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
