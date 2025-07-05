import { createServer } from '@/lib/supabase/server';
import { UsersClientPage } from './client';

export default async function UsersPage() {
  const supabase = createServer();
  
  // This single query fetches users who are linked to organisation_id = 1
  // and includes their related organisation and role names, exactly
  // mirroring the logic of the user's provided SQL query.
  const { data, error } = await supabase
    .from('user_organisations')
    .select(`
      user:user_id!inner(id, name, email, phone, profile_image_url, is_deleted),
      organisation:organisations(name),
      role:organisation_roles(name)
    `)
    .eq('organisation_id', 1);

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
            organisation: item.organisation?.name ?? 'N/A',
            role: item.role?.name ?? 'N/A',
        }
    })
    .filter(Boolean) as any[] // Remove nulls and satisfy type
    || [];

  return <UsersClientPage users={users} />;
}
