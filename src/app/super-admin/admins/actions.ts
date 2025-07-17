
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

  // 1. Create the user in Supabase Auth.
  // A trigger (create_admin_user) in the DB will automatically create the public.user profile.
  // We pass the name and phone in metadata so the trigger can access it.
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    phone,
    email_confirm: true,
    user_metadata: { 
        name: name,
        phone: phone || null,
        user_type: 2 // Specify user_type for the trigger
    }
  });
  
  if (authError) {
      console.error("Error creating auth user:", authError);
      return { error: `Failed to create user: ${authError.message}` };
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
