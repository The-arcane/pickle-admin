
'use server';

import { createServerClient } from '@supabase/ssr';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

// Helper to create a dedicated admin client with service_role key
function createAdminClient() {
    const cookieStore = cookies();
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
                set(name: string, value: string, options) {
                    try {
                        cookieStore.set({ name, value, ...options });
                    } catch (error) {
                        // The `set` method was called from a Server Component.
                    }
                },
                remove(name: string, options) {
                    try {
                        cookieStore.set({ name, value: '', ...options });
                    } catch (error) {
                        // The `delete` method was called from a Server Component.
                    }
                },
            },
        }
    );
}

// This action creates a user with user_type = 2 (Admin)
export async function addAdmin(formData: FormData) {
  const supabaseAdmin = createAdminClient();

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
    // This is a security override needed when creating users with the service role key
    // if the "Allow new users to sign up" setting is disabled in your Supabase project.
    gotrue_meta_security: {
        "x-real-ip":"127.0.0.1",
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
    const supabaseAdmin = createAdminClient(); 

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
