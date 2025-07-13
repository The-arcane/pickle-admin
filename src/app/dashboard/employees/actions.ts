
'use server';

import { createServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addEmployee(formData: FormData) {
  const supabase = createServer(true); // use service role key to bypass RLS for user creation

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const organisation_id = Number(formData.get('organisation_id'));

  if (!email || !name || !organisation_id) {
    return { error: "Name, email, and organization ID are required." };
  }

  // Generate a random password for the invitation
  const password = Math.random().toString(36).slice(-8);

  // 1. Create the user in Supabase Auth
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Auto-confirm the email
  });
  
  if (authError) {
      console.error("Error creating auth user:", authError);
      return { error: `Failed to create user: ${authError.message}` };
  }
  if (!authUser.user) {
      return { error: 'Could not create user account.' };
  }

  // 2. Insert into public.user table
  const { error: profileError } = await supabase
    .from('user')
    .insert({
        user_uuid: authUser.user.id,
        name,
        email,
        phone,
        user_type: 4, // 4 for Employee
    });

  if (profileError) {
      console.error("Error creating user profile:", profileError);
      // Attempt to clean up the auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authUser.user.id);
      return { error: `Failed to create user profile: ${profileError.message}` };
  }

  // 3. Link user to organization with 'Employee' role
  const { data: userRecord } = await supabase.from('user').select('id').eq('user_uuid', authUser.user.id).single();
  const { data: employeeRole } = await supabase.from('organisation_roles').select('id').eq('name', 'Employee').single();
  
  if (!userRecord || !employeeRole) {
       await supabase.auth.admin.deleteUser(authUser.user.id);
       return { error: "Could not find user record or employee role to create association." };
  }

  const { error: linkError } = await supabase
    .from('user_organisations')
    .insert({
        user_id: userRecord.id,
        organisation_id: organisation_id,
        role_id: employeeRole.id,
    });
    
  if (linkError) {
       console.error("Error linking employee to organization:", linkError);
       await supabase.auth.admin.deleteUser(authUser.user.id);
       return { error: `Failed to link employee to organization: ${linkError.message}` };
  }

  // 4. Send invitation email
  const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email);
  if (inviteError) {
      console.error("Error sending invite email:", inviteError);
      // Don't fail the whole process, but notify the admin
      return { success: true, message: "Employee created, but failed to send invitation email. Please ask them to use the password reset flow." };
  }

  revalidatePath('/dashboard/employees');
  
  return { success: true, message: "Employee successfully invited." };
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
