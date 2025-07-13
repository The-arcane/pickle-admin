
'use server';

import { createServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// This is almost identical to the addEmployee action, but sets user_type to 2 (Admin)
export async function addAdmin(formData: FormData) {
  const supabase = createServer(true);

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const organisation_id = Number(formData.get('organisation_id'));

  if (!email || !name || !organisation_id) {
    return { error: "Name, email, and organization are required." };
  }

  const password = Math.random().toString(36).slice(-8);

  // 1. Create the user in Supabase Auth
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
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
        user_type: 2, // 2 for Admin
    });

  if (profileError) {
      console.error("Error creating user profile:", profileError);
      await supabase.auth.admin.deleteUser(authUser.user.id);
      return { error: `Failed to create user profile: ${profileError.message}` };
  }

  // 3. Link user to organization with 'Admin' role
  const { data: userRecord } = await supabase.from('user').select('id').eq('user_uuid', authUser.user.id).single();
  const { data: adminRole } = await supabase.from('organisation_roles').select('id').eq('name', 'Admin').single();
  
  if (!userRecord || !adminRole) {
       await supabase.auth.admin.deleteUser(authUser.user.id);
       return { error: "Could not find user record or admin role to create association." };
  }

  const { error: linkError } = await supabase
    .from('user_organisations')
    .insert({
        user_id: userRecord.id,
        organisation_id: organisation_id,
        role_id: adminRole.id,
    });
    
  if (linkError) {
       console.error("Error linking admin to organization:", linkError);
       await supabase.auth.admin.deleteUser(authUser.user.id);
       return { error: `Failed to link admin to organization: ${linkError.message}` };
  }

  // 4. Send invitation email
  const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email);
  if (inviteError) {
      console.error("Error sending invite email:", inviteError);
      return { success: true, message: "Admin created, but failed to send invitation email. Please ask them to use the password reset flow." };
  }

  revalidatePath('/super-admin/admins');
  
  return { success: true, message: "Admin successfully invited." };
}

// This is identical to removeEmployee
export async function removeAdmin(formData: FormData) {
    const supabase = createServer(true);
    const userId = formData.get('user_id') as string;

    if (!userId) {
        return { error: 'User ID is required.' };
    }

    const { data: user } = await supabase.from('user').select('user_uuid').eq('id', userId).single();
    if (!user) {
        return { error: 'User not found.' };
    }
    
    const { error } = await supabase.auth.admin.deleteUser(user.user_uuid);

    if (error) {
        console.error("Error removing admin:", error);
        return { error: `Failed to remove admin: ${error.message}` };
    }
    
    revalidatePath('/super-admin/admins');

    return { success: true, message: "Admin removed successfully." };
}
