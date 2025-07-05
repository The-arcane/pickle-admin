import { createServer } from '@/lib/supabase/server';
import { UsersClientPage } from './client';

export default async function UsersPage() {
  const supabase = createServer();
  
  let users = [];
  let fetchError: { message: string, details: string, hint: string, code: string } | null = null;

  // This query is a direct translation of the required SQL logic:
  // SELECT u.* FROM "user" u JOIN user_organisations uo ON u.id = uo.user_id
  // WHERE uo.organisation_id = 1 AND uo.role_id IS NOT NULL;
  // It starts from the 'user_organisations' table and performs an inner join to get user details.
  const { data: orgUserData, error: usersError } = await supabase
    .from('user_organisations')
    .select('user!inner(id, name, email, phone, profile_image_url, is_deleted)')
    .eq('organisation_id', 1)
    .not('role_id', 'is', null);


  if (usersError) {
    console.error('Error fetching user details:', usersError);
    fetchError = { ...usersError };
  } else if (orgUserData && orgUserData.length > 0) {
    // The data is nested, so we need to extract the user details.
    // The result from the query is an array of objects, where each object has a 'user' property.
    users = orgUserData
      .map(item => item.user)
      .filter(user => user !== null) // Filter out any potential null user objects
      .map(user => ({
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
