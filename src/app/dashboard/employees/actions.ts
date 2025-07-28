
'use server';

import { revalidatePath } from 'next/cache';
import { createServer, createServiceRoleServer } from '@/lib/supabase/server';

export async function addEmployee(formData: FormData) {
  const supabase = createServer(); // For getting current user
  const supabaseAdmin = createServiceRoleServer(); // For creating a new user

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const organisation_id = Number(formData.get('organisation_id'));
  const password = formData.get('password') as string;

  if (!email || !name || !organisation_id || !password) {
    return { error: "Name, email, password, and organization ID are required." };
  }
  
  // Get the current logged-in user (the admin) who will be the manager.
  const { data: { user: adminUser } } = await supabase.auth.getUser();
  if (!adminUser) {
    return { error: 'You must be logged in to add an employee.' };
  }
  const { data: managerProfile } = await supabase.from('user').select('id').eq('user_uuid', adminUser.id).single();
   if (!managerProfile) {
    return { error: 'Could not find your admin profile.' };
  }
  const managerId = managerProfile.id;


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
  const newUserUuid = authUser.user.id;

  // 2. Update the auto-created public.user record with the correct user_type and phone.
  const { data: newEmployee, error: profileError } = await supabaseAdmin
    .from('user')
    .update({
        user_type: 4, // 4 for Employee
        phone: phone || null,
        name: name
    })
    .eq('user_uuid', newUserUuid)
    .select('id')
    .single();

  if (profileError || !newEmployee) {
      console.error("Error creating user profile:", profileError);
      // Attempt to clean up the auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(newUserUuid);
      return { error: `Failed to create user profile: ${profileError?.message}` };
  }
  const newEmployeeId = newEmployee.id;

  // 3. Link user to organization with 'employee' role
  const { data: employeeRole } = await supabaseAdmin.from('organisation_roles').select('id').eq('name', 'employee').single();
  
  if (!employeeRole) {
       await supabaseAdmin.auth.admin.deleteUser(newUserUuid);
       return { error: "Could not find 'employee' role in the database." };
  }

  const { error: linkError } = await supabaseAdmin
    .from('user_organisations')
    .insert({
        user_id: newEmployeeId,
        organisation_id: organisation_id,
        role_id: employeeRole.id,
    });
    
  if (linkError) {
       console.error("Error linking employee to organization:", linkError);
       await supabaseAdmin.auth.admin.deleteUser(newUserUuid);
       return { error: `Failed to link employee to organization: ${linkError.message}` };
  }
  
  // 4. Create the manager-employee relationship in user_employee_permissions
  const { data: permissionLink, error: permissionLinkError } = await supabaseAdmin
    .from('user_employee_permissions')
    .insert({
        manager_id: managerId,
        employee_id: newEmployeeId
    })
    .select('id')
    .single();

  if (permissionLinkError || !permissionLink) {
       console.error("Error creating employee permission link:", permissionLinkError);
       // Clean up previous steps if this fails
       await supabaseAdmin.auth.admin.deleteUser(newUserUuid);
       return { error: `Failed to set up employee-manager relationship: ${permissionLinkError?.message}` };
  }
  const permissionLinkId = permissionLink.id;

  // 5. Set default entity permissions for the new employee
  const { data: entities, error: entitiesError } = await supabaseAdmin.from('permission_entity').select('id');
  if (entitiesError || !entities) {
      console.error("Error fetching permission entities:", entitiesError);
      await supabaseAdmin.auth.admin.deleteUser(newUserUuid);
      return { error: "Could not fetch permission entities to set defaults." };
  }

  const entityPermissionsToInsert = entities.map(entity => ({
      user_employee_permission_id: permissionLinkId,
      entity_id: entity.id,
      can_add: true,
      can_edit: true,
      can_delete: true,
      can_update: true,
      can_view: true
  }));

  const { error: entityPermissionsError } = await supabaseAdmin
    .from('user_employee_entity_permissions')
    .insert(entityPermissionsToInsert);

  if (entityPermissionsError) {
      console.error("Error setting default entity permissions:", entityPermissionsError);
      await supabaseAdmin.auth.admin.deleteUser(newUserUuid);
      return { error: `Failed to set default permissions for the employee: ${entityPermissionsError.message}` };
  }

  revalidatePath('/dashboard/employees');
  
  return { success: true, message: "Employee successfully created with default permissions." };
}


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
    
    revalidatePath('/dashboard/employees');

    return { success: true, message: "Employee removed successfully." };
}
