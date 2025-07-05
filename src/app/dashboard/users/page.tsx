import { createServer } from '@/lib/supabase/server';
import { UsersClientPage } from './client';

export default async function UsersPage() {
  const supabase = createServer();
  
  let users = [];
  let fetchError: { message: string, details: string, hint: string, code: string } | null = null;

  // This query is a direct translation of the required SQL logic:
  // SELECT u.* FROM user u JOIN user_organisations uo ON u.id = uo.user_id
  // WHERE uo.organisation_id = 1 AND uo.role_id IS NOT NULL;
  const { data: usersData, error: usersError } = await supabase
    .from('user')
    .select('id, name, email, phone, profile_image_url, is_deleted, user_organisations!inner(*)')
    .eq('user_organisations.organisation_id', 1)
    .not('user_organisations.role_id', 'is', null);


  if (usersError) {
    console.error('Error fetching user details:', usersError);
    fetchError = { ...usersError };
  } else if (usersData && usersData.length > 0) {
    users = usersData.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      status: user.is_deleted ? 'Inactive' : 'Active',
      avatar: user.profile_image_url,
    }));
  } else {
      console.log("No users found matching the specified criteria.");
  }

  return <UsersClientPage users={users} error={fetchError} />;
}
