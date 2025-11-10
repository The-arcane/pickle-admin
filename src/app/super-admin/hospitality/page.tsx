
import { createServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { HospitalityClientPage } from './client';
import type { User } from '@/types';

export default async function HospitalityPage() {
  const supabase = await createServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/login?type=super-admin');
  }

  // Find the ID for the 'hospitality' organization type
  const { data: hospitalityType } = await supabase
    .from('organisation_types')
    .select('id')
    .eq('type_name', 'hospitality')
    .single();

  let orgsData: any[] = [];
  if (hospitalityType) {
    const { data, error } = await supabase
      .from('organisations')
      .select(`
          id, name, address, logo, is_active,
          user:user_id ( name, email )
      `)
      .eq('type', hospitalityType.id);

    if (error) {
      console.error('Error fetching hospitality orgs:', error);
    } else {
      orgsData = data || [];
    }
  } else {
    console.error("Could not find 'hospitality' in organisation_types table.");
  }

  // Fetch admin users (user_type 8) who are NOT linked to any organization yet.
  const { data: allAdmins, error: usersError } = await supabase.from('user').select('id, name, email').eq('user_type', 8).order('name');
  if (usersError) {
      console.error("Error fetching hospitality admin users:", usersError);
  }

  const { data: assignedLinks, error: linksError } = await supabase.from('user_organisations').select('user_id');
  if(linksError) {
      console.error("Error fetching assigned user links:", linksError);
  }
  const assignedUserIds = new Set((assignedLinks || []).map(link => link.user_id));

  const unassignedAdmins = (allAdmins || []).filter(admin => !assignedUserIds.has(admin.id));
  
  return <HospitalityClientPage orgs={orgsData} users={unassignedAdmins as User[]} />;
}
