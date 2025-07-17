
'use server';

import { createServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addEmployee(formData: FormData) {
  const supabase = createServer(true); // use service role key to bypass RLS for user creation

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const organisation_id = Number(formData.get('organisation_id'));
  const password = formData.get('password') as string;

  if (!email || !name || !organisation_id || !password) {
    return { error: "Name, email, password, and organization ID are required." };
  }

  // 1. Create the user in Supabase Auth
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
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
  const { data: updatedUser, error: profileError } = await supabase
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
      await supabase.auth.admin.deleteUser(userUuid);
      return { error: `Failed to create user profile: ${profileError?.message}` };
  }
  const userId = updatedUser.id;

  // 3. Link user to organization with 'employee' role
  const { data: employeeRole } = await supabase.from('organisation_roles').select('id').eq('name', 'employee').single();
  
  if (!employeeRole) {
       await supabase.auth.admin.deleteUser(userUuid);
       return { error: "Could not find 'employee' role in the database." };
  }

  const { error: linkError } = await supabase
    .from('user_organisations')
    .insert({
        user_id: userId,
        organisation_id: organisation_id,
        role_id: employeeRole.id,
    });
    
  if (linkError) {
       console.error("Error linking employee to organization:", linkError);
       await supabase.auth.admin.deleteUser(userUuid);
       return { error: `Failed to link employee to organization: ${linkError.message}` };
  }

  revalidatePath('/dashboard/employees');
  
  return { success: true, message: "Employee successfully created." };
}


export async function removeEmployee(formData: FormData) {
    const supabase = createServer(true); // Use service role
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
        console.error("Error removing employee:", error);
        return { error: `Failed to remove employee: ${error.message}` };
    }
    
    revalidatePath('/dashboard/employees');

    return { success: true, message: "Employee removed successfully." };
}
