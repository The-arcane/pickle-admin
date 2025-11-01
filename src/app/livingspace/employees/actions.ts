
'use server';

import { revalidatePath } from 'next/cache';
import { createServiceRoleServer } from '@/lib/supabase/server';

// This action creates a user with user_type = 4 (Employee)
export async function addEmployee(formData: FormData) {
  const supabaseAdmin = createServiceRoleServer();

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const password = formData.get('password') as string;
  const organisationId = formData.get('organisation_id') as string;

  if (!email || !name || !password || !organisationId) {
    return { error: "Name, email, password, and organization ID are required." };
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
      console.error("Error creating auth user for employee:", authError);
      return { error: `Failed to create auth user: ${authError?.message}` };
  }

  // 2. The user profile is created via a trigger. Now, update it with the correct details.
  const { data: userProfile, error: profileError } = await supabaseAdmin
    .from('user')
    .update({
        user_type: 4, // Set user_type to 4 for Employee
        name: name,
        phone: phone || null
    })
    .eq('user_uuid', authData.user.id)
    .select('id')
    .single();
  
  if (profileError || !userProfile) {
      console.error("Error updating user profile for employee:", profileError);
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return { error: `Failed to set user profile as Employee: ${profileError.message}` };
  }

  // 3. Link the new user to the organization
  const { error: orgLinkError } = await supabaseAdmin.from('user_organisations').insert({
    user_id: userProfile.id,
    organisation_id: Number(organisationId),
    role_id: 4 // Assuming 4 is the 'Employee' role in 'organisation_roles'
  });

  if (orgLinkError) {
      console.error("Error linking employee to organization:", orgLinkError);
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return { error: `Failed to link employee to organization: ${orgLinkError.message}` };
  }

  revalidatePath('/livingspace/employees');
  
  return { success: true, message: "Employee successfully created and linked." };
}

// removeEmployee requires the service role key to delete a user from auth schema.
export async function removeEmployee(formData: FormData) {
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
        console.error("Error removing employee:", error);
        return { error: `Failed to remove employee: ${error.message}` };
    }
    
    revalidatePath('/livingspace/employees');

    return { success: true, message: "Employee removed successfully." };
}
