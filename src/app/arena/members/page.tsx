
import { createServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { UsersClientPage } from '@/app/education/users/client';
import type { UserWithRole, Role } from '@/app/education/users/types';

export default async function ArenaMembersPage() {
  const supabase = await createServer();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/login?type=arena');
  }

  const { data: userRecord } = await supabase
    .from('user')
    .select('id')
    .eq('user_uuid', user.id)
    .single();

  const { data: orgLink } = await supabase
    .from('user_organisations')
    .select('organisation_id')
    .eq('user_id', userRecord?.id ?? -1)
    .maybeSingle();

  const organisationId = orgLink?.organisation_id;

  let users: UserWithRole[] = [];
  let roles: Role[] = [];

  if (organisationId) {
    const { data: orgUsers, error } = await supabase
      .from('user_organisations')
      .select('user!inner(*), role:organisation_roles!inner(*)')
      .eq('organisation_id', organisationId);

    if (error) {
      console.error('Error fetching members:', error);
    } else {
      users = orgUsers.map(ou => ({ user: ou.user, role: ou.role })) as UserWithRole[];
      const uniqueRoles = Array.from(new Map(users.map(u => [u.role.id, u.role])).values());
      roles = uniqueRoles;
    }
  }

  return <UsersClientPage users={users} roles={roles} />;
}
