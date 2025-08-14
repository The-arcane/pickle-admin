
import { createServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { UsersClientPage } from './client';
import type { UserWithRole } from './types';

export default async function EducationUsersPage() {
  const supabase = await createServer();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) {
    return redirect('/login?type=education');
  }

  const { data: userProfile } = await supabase.from('user').select('id').eq('user_uuid', authUser.id).single();
  if (!userProfile) {
    return redirect('/login?type=education&error=User profile not found.');
  }

  const { data: orgLink } = await supabase.from('user_organisations').select('organisation_id').eq('user_id', userProfile.id).single();
  if (!orgLink) {
    return <p>You are not associated with any school.</p>;
  }

  const { data: usersData, error } = await supabase
    .from('user_organisations')
    .select(`
        user:user_id!inner(*),
        role:organisation_roles!inner(name)
    `)
    .eq('organisation_id', orgLink.organisation_id);

  if (error) {
      console.error("Error fetching users for school:", error);
  }
  
  const users = (usersData as UserWithRole[]) || [];

  return <UsersClientPage users={users} />;
}
