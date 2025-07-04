import { createServer } from '@/lib/supabase/server';
import { UsersClientPage } from './client';

export default async function UsersPage() {
  const supabase = createServer();
  const { data: usersData, error } = await supabase
    .from('user')
    .select('id, name, email, phone, profile_image_url, is_deleted')
    .eq('user_type', 1);

  if (error) {
    console.error('Error fetching users:', error);
  }
  
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
