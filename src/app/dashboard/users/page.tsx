
import { createServer } from '@/lib/supabase/server';
import { UsersClientPage } from './client';
import { redirect } from 'next/navigation';

export default async function UsersPage() {
  const supabase = createServer();
  
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) {
    return redirect('/login');
  }

  const { data: userRecord } = await supabase
    .from('user')
    .select('id')
    .eq('user_uuid', authUser.id)
    .single();

  if (!userRecord) {
    return redirect('/login');
  }
  
  const { data: orgLink } = await supabase
    .from('user_organisations')
    .select('organisation_id')
    .eq('user_id', userRecord.id)
    .maybeSingle();

  const organisationId = orgLink?.organisation_id;
  
  let users = [];
  let fetchError: { message: string, details: string, hint: string, code: string } | null = null;
  
  if (organisationId) {
    const { data: orgUserData, error: usersError } = await supabase
      .from('user_organisations')
      .select('user!inner(id, name, email, phone, profile_image_url, is_deleted)')
      .eq('organisation_id', organisationId)
      .not('role_id', 'is', null);

    if (usersError) {
      console.error('Error fetching user details:', usersError);
      fetchError = { ...usersError };
    } else if (orgUserData && orgUserData.length > 0) {
      users = orgUserData
        .map(item => item.user)
        .filter(user => user !== null)
        .map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          status: user.is_deleted ? 'Inactive' : 'Active',
          avatar: user.profile_image_url,
      }));
    } else {
        console.log("No users found matching the specified criteria for this organization.");
    }
  } else {
     console.log("Admin user is not linked to an organization.");
  }


  return <UsersClientPage users={users} error={fetchError} />;
}
