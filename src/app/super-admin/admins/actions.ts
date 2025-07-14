
'use server';

import { createServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// This action creates a user with user_type = 2 (Admin)
export async function addAdmin(formData: FormData) {
  // Use service role key to bypass RLS for user creation
  const supabase = await createServer(true); 

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const password = formData.get('password') as string;

  if (!email || !name || !password) {
    return { error: "Name, email, and password are required." };
  }

  // 1. Create the user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Auto-confirm the email
    user_metadata: { name: name }
  });
  
  if (authError) {
      console.error("Error creating auth user:", authError);
      return { error: `Failed to create user: ${authError.message}` };
  }
  if (!authData.user) {
      return { error: 'Could not create user account.' };
  }

  // 2. Insert into public.user table
  const { error: profileError } = await supabase
    .from('user')
    .insert({
        user_uuid: authData.user.id,
        name,
        email,
        phone,
        user_type: 2, // 2 for Admin
    });

  if (profileError) {
      console.error("Error creating user profile:", profileError);
      // Attempt to clean up the auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      return { error: `Failed to create user profile: ${profileError.message}` };
  }


  revalidatePath('/super-admin/admins');
  
  return { success: true, message: "Admin user successfully created." };
}

// removeAdmin requires the service role key to delete a user from auth schema.
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
