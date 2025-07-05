import { createServer } from '@/lib/supabase/server';
import { UsersClientPage } from './client';

export default async function UsersPage() {
  const supabase = createServer();
  
  let users = [];
  let fetchError: { message: string, details: string, hint: string, code: string } | null = null;

  // Step 1: Fetch user IDs from user_organisations table
  const { data: userOrgData, error: userOrgError } = await supabase
    .from('user_organisations')
    .select('user_id')
    .eq('organisation_id', 1)
    .not('role_id', 'is', null);

  if (userOrgError) {
    console.error('Error fetching user organisations:', userOrgError);
    fetchError = { ...userOrgError };
  } else if (userOrgData && userOrgData.length > 0) {
    const userIds = userOrgData.map(uo => uo.user_id);

    // Step 2: Fetch details for the collected user IDs
    const { data: usersData, error: usersError } = await supabase
      .from('user')
      .select('id, name, email, phone, profile_image_url, is_deleted')
      .in('id', userIds);

    if (usersError) {
      console.error('Error fetching user details:', usersError);
      fetchError = { ...usersError };
    } else {
      users = usersData?.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        status: user.is_deleted ? 'Inactive' : 'Active',
        avatar: user.profile_image_url,
      })) || [];
    }
  } else {
      console.log("No users found in user_organisations matching criteria. The list will be empty.");
  }

  return <UsersClientPage users={users} error={fetchError} />;
}
