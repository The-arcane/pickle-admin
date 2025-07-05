import { createServer } from '@/lib/supabase/server';
import { UsersClientPage } from './client';

type User = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    profile_image_url: string | null;
    is_deleted: boolean;
};

export default async function UsersPage() {
  const supabase = createServer();
  
  // As per the user's request, fetching users based on their organisation.
  // This query fetches all users associated with `organisation_id = 1`
  // via the `user_organisations` join table.
  const { data: userOrgsData, error } = await supabase
    .from('user_organisations')
    .select('user:user_id(id, name, email, phone, profile_image_url, is_deleted)')
    .eq('organisation_id', 1);

  if (error) {
    console.error('Error fetching users:', error);
  }
  
  const users = userOrgsData
    ?.map(orgUser => {
        const user = orgUser.user as User | null; // Cast to access properties
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
    .filter(Boolean) // Remove nulls from the array
    || [];

  return <UsersClientPage users={users} />;
}
