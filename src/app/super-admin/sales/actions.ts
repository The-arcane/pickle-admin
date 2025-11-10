

'use server';

import { revalidatePath } from 'next/cache';
import { createServiceRoleServer } from '@/lib/supabase/server';

// This action creates a user with user_type = 6 (Sales)
export async function addSalesPerson(formData: FormData) {
  const supabaseAdmin = await createServiceRoleServer();

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
    email_confirm: true, // Auto-confirm the user's email
    user_metadata: { name: name },
  });
  
  if (authError || !authData.user) {
      console.error("Error creating auth user:", authError);
      return { error: `Failed to create auth user: ${authError?.message}` };
  }

  // 2. The user profile is created via a trigger. Now, update it with the correct details.
  const { error: profileError } = await supabaseAdmin
    .from('user')
    .update({
        user_type: 6, // Set user_type to 6 for Sales
        name: name,
        phone: phone || null
    })
    .eq('user_uuid', authData.user.id);
  
  if (profileError) {
      console.error("Error updating user profile:", profileError);
      // If updating the profile fails, we should delete the auth user to avoid orphaned accounts.
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return { error: `Failed to set user profile as Sales: ${profileError.message}` };
  }

  revalidatePath('/super-admin/sales');
  
  return { success: true, message: "Sales user successfully created." };
}

// removeSalesPerson requires the service role key to delete a user from auth schema.
export async function removeSalesPerson(formData: FormData) {
    const supabaseAdmin = await createServiceRoleServer(); 

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
        console.error("Error removing sales person:", error);
        return { error: `Failed to remove sales person: ${error.message}` };
    }
    
    revalidatePath('/super-admin/sales');

    return { success: true, message: "Sales person removed successfully." };
}
