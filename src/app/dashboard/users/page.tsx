import { createServer } from '@/lib/supabase/server';
import { UsersClientPage } from './client';

export default async function UsersPage() {
  const supabase = createServer();

  // Step 1: Fetch user IDs from user_organisations table based on the criteria.
  // This replicates: WHERE uo.organisation_id = 1 AND uo.role_id IS NOT NULL
  const { data: userOrgData, error: userOrgError } = await supabase
    .from('user_organisations')
    .select('user_id')
    .eq('organisation_id', 1)
    .not('role_id', 'is', null);

  if (userOrgError) {
    console.error('Error fetching user organisations:', userOrgError);
    return <UsersClientPage users={[]} />;
  }

  if (!userOrgData || userOrgData.length === 0) {
    // No users match the criteria, return empty page.
    return <UsersClientPage users={[]} />;
  }

  const userIds = userOrgData.map(uo => uo.user_id);

  // Step 2: Fetch the details for the collected user IDs from the user table.
  // This replicates: JOIN public."user" u ON u.id = uo.user_id
  const { data: usersData, error: usersError } = await supabase
    .from('user')
    .select('id, name, email, phone, profile_image_url, is_deleted')
    .in('id', userIds);

  if (usersError) {
    console.error('Error fetching user details:', usersError);
    return <UsersClientPage users={[]} />;
  }

  // Map the final data into the shape the client component expects.
  // This replicates: SELECT u.name, u.email, u.phone, CASE ... END AS status
  const users = usersData?.map(user => ({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    status: user.is_deleted ? 'Inactive' : 'Active',
    avatar: user.profile_image_url,
  })) || [];

  return <UsersClientPage users={users} />;
}
