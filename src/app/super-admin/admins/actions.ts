
'use server';

import { revalidatePath } from 'next/cache';
import { createServiceRoleServer } from '@/lib/supabase/server';

// This action creates a user with user_type = 2 (Admin)
export async function addAdmin(formData: FormData) {
  const supabaseAdmin = createServiceRoleServer();

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const password = formData.get('password') as string;

  if (!email || !name || !password) {
    return { error: "Name, email, and password are required." };
  }

  // 1. Create the user in Supabase Auth.
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    phone: phone || undefined,
    email_confirm: true,
    user_metadata: { name: name },
    // This `options` block is now correctly structured at the top level
    data: {
      bypass_email_provider_block: true,
    }
  });
  
  if (authError || !authData.user) {
      console.error("Error creating auth user:", authError);
      return { error: `Failed to create auth user: ${authError?.message}` };
  }

  // 2. The user profile is created via a trigger. Now, update it with the correct details.
  const { error: profileError } = await supabaseAdmin
    .from('user')
    .update({
        user_type: 2, // Set user_type to 2 for Admin
        name: name,
        phone: phone || null
    })
    .eq('user_uuid', authData.user.id);
  
  if (profileError) {
      console.error("Error updating user profile:", profileError);
      // If updating the profile fails, we should delete the auth user to avoid orphaned accounts.
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return { error: `Failed to set user profile as Admin: ${profileError.message}` };
  }

  revalidatePath('/super-admin/admins');
  
  return { success: true, message: "Admin user successfully created." };
}

// removeAdmin requires the service role key to delete a user from auth schema.
export async function removeAdmin(formData: FormData) {
    const supabaseAdmin = createServiceRoleServer(); 

    const userId = formData.get('user_id') as string;

    if (!userId) {
        return { error: 'User ID is required.' };
    }

    const { data: user } = await supabaseAdmin.from('user').select('user_uuid').eq('id', userId).single();
    if (!user) {
        return { error: 'User not found.' };
    }
    
    // Deleting the auth user will cascade and delete the public user and user_organisations link
    const { error } = await supabaseAdmin.auth.admin.deleteUser(user.user_uuid);

    if (error) {
        console.error("Error removing admin:", error);
        return { error: `Failed to remove admin: ${error.message}` };
    }
    
    revalidatePath('/super-admin/admins');

    return { success: true, message: "Admin removed successfully." };
}
