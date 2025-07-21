'use server';

import { createServerClient } from '@supabase/ssr';
import { createServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

// Helper to create a dedicated admin client
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

export async function addEmployee(formData: FormData) {
  const supabaseAdmin = createAdminClient();

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const organisation_id = Number(formData.get('organisation_id'));
  const password = formData.get('password') as string;

  if (!email || !name || !organisation_id || !password) {
    return { error: "Name, email, password, and organization ID are required." };
  }

  // 1. Create the user in Supabase Auth
  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Auto-confirm the email
    user_metadata: { name: name }
  });
  
  if (authError) {
      console.error("Error creating auth user:", authError);
      return { error: `Failed to create user: ${authError.message}` };
  }
  if (!authUser.user) {
      return { error: 'Could not create user account.' };
  }
  const userUuid = authUser.user.id;

  // 2. Update the auto-created public.user record with the correct user_type and phone.
  const { data: updatedUser, error: profileError } = await supabaseAdmin
    .from('user')
    .update({
        user_type: 4, // 4 for Employee
        phone: phone || null,
        name: name
    })
    .eq('user_uuid', userUuid)
    .select('id')
    .single();

  if (profileError || !updatedUser) {
      console.error("Error creating user profile:", profileError);
      // Attempt to clean up the auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(userUuid);
      return { error: `Failed to create user profile: ${profileError?.message}` };
  }
  const userId = updatedUser.id;

  // 3. Link user to organization with 'employee' role
  const { data: employeeRole } = await supabaseAdmin.from('organisation_roles').select('id').eq('name', 'employee').single();
  
  if (!employeeRole) {
       await supabaseAdmin.auth.admin.deleteUser(userUuid);
       return { error: "Could not find 'employee' role in the database." };
  }

  const { error: linkError } = await supabaseAdmin
    .from('user_organisations')
    .insert({
        user_id: userId,
        organisation_id: organisation_id,
        role_id: employeeRole.id,
    });
    
  if (linkError) {
       console.error("Error linking employee to organization:", linkError);
       await supabaseAdmin.auth.admin.deleteUser(userUuid);
       return { error: `Failed to link employee to organization: ${linkError.message}` };
  }

  revalidatePath('/dashboard/employees');
  
  return { success: true, message: "Employee successfully created." };
}


export async function removeEmployee(formData: FormData) {
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
        console.error("Error removing employee:", error);
        return { error: `Failed to remove employee: ${error.message}` };
    }
    
    revalidatePath('/dashboard/employees');

    return { success: true, message: "Employee removed successfully." };
}
