import { createServer } from '@/lib/supabase/server';
import { UsersClientPage } from './client';

export default async function UsersPage() {
  const supabase = createServer();
  
  // The user requested to fetch users based on a specific SQL query joining
  // user_organisations with the user table for organisation_id = 1.
  // To implement this robustly with the Supabase client, we'll do it in two steps:
  // 1. Fetch all `user_id`s from the `user_organisations` junction table.
  // 2. Fetch the details for those specific users from the `user` table.

  // Step 1: Get user IDs from the junction table for organisation_id = 1
  const { data: userOrgLinks, error: linksError } = await supabase
    .from('user_organisations')
    .select('user_id')
    .eq('organisation_id', 1);

  if (linksError) {
    console.error('Error fetching user-organisation links:', linksError);
    return <UsersClientPage users={[]} />; // Render page with no users on error
  }
  
  const userIds = userOrgLinks.map(link => link.user_id);

  if (!userIds || userIds.length === 0) {
    // No users found for this organisation
    return <UsersClientPage users={[]} />;
  }

  // Step 2: Fetch all users whose IDs are in the list we just retrieved
  const { data: usersData, error: usersError } = await supabase
    .from('user')
    .select('id, name, email, phone, profile_image_url, is_deleted')
    .in('id', userIds);

  if (usersError) {
    console.error('Error fetching users by ID:', usersError);
    return <UsersClientPage users={[]} />;
  }
  
  const users = usersData
    ?.map(user => {
        if (!user) return null;
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            status: user.is_deleted ? 'Inactive' : 'Active',
            avatar: user.profile_image_url,
        }
    })
    .filter(Boolean) as any[] // Remove nulls and satisfy type
    || [];

  return <UsersClientPage users={users} />;
}
