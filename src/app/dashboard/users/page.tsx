import { createServer } from '@/lib/supabase/server';
import { UsersClientPage } from './client';

export default async function UsersPage() {
  const supabase = createServer();
  
  // This query replicates the user's provided SQL:
  // SELECT u.name, u.email, u.phone, CASE WHEN u.is_deleted = false THEN 'Active' ELSE 'Inactive' END AS status
  // FROM public.user_organisations uo
  // JOIN public."user" u ON u.id = uo.user_id
  // WHERE uo.organisation_id = 1 AND uo.role_id IS NOT NULL;
  const { data, error } = await supabase
    .from('user_organisations')
    .select('user:user_id!inner(id, name, email, phone, profile_image_url, is_deleted)')
    .eq('organisation_id', 1)
    .not('role_id', 'is', null);

  if (error) {
    console.error('Error fetching users:', error);
    return <UsersClientPage users={[]} />;
  }
  
  const users = data
    ?.map(item => {
        // The !inner join ensures item.user is not null, but we check just in case.
        if (!item.user) return null;

        return {
            id: item.user.id,
            name: item.user.name,
            email: item.user.email,
            phone: item.user.phone,
            status: item.user.is_deleted ? 'Inactive' : 'Active',
            avatar: item.user.profile_image_url,
        }
    })
    .filter(Boolean) as any[] // Remove nulls and satisfy type
    || [];

  return <UsersClientPage users={users} />;
}
