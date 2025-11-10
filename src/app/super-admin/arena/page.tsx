
import { createServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ArenaClientPage } from './client';

export default async function ArenaPage() {
  const supabase = await createServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/login?type=super-admin');
  }

  // Find the ID for the 'public arena' organization type
  const { data: arenaType } = await supabase
    .from('organisation_types')
    .select('id')
    .eq('type_name', 'public arena')
    .single();

  let orgsData: any[] = [];
  if (arenaType) {
    const { data, error } = await supabase
      .from('organisations')
      .select(`
          id, name, address, logo, is_active,
          user:user_id ( name, email )
      `)
      .eq('type', arenaType.id);

    if (error) {
      console.error('Error fetching arena orgs:', error);
    } else {
      orgsData = data || [];
    }
  } else {
    console.error("Could not find 'public arena' in organisation_types table.");
  }
  
  // Fetch admin users (user_type 2) who are NOT linked to any organization yet.
  const { data: usersData, error: usersError } = await supabase
    .from('user')
    .select('id, name, email,user_organisations!left(user_id)')
    .eq('user_type', 2)
    .is('user_organisations.user_id', null)
    .order('name');
  
  if (usersError) {
      console.error("Error fetching unassigned arena admin users:", usersError);
  }
  
  return <ArenaClientPage orgs={orgsData} users={usersData || []} />;
}
