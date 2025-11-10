
import { createServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { SchoolsClientPage } from './client';
import type { User } from '@/types';

export default async function SchoolsPage() {
  const supabase = await createServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/login?type=super-admin');
  }

  // Find the ID for the 'education' organization type
  const { data: educationType } = await supabase
    .from('organisation_types')
    .select('id')
    .eq('type_name', 'education')
    .single();

  let schoolsData: any[] = [];
  if (educationType) {
    // Fetch all organizations that are of type 'Education'
    const { data, error } = await supabase
      .from('organisations')
      .select(`
          id, name, address, logo, is_active,
          user:user_id ( name, email )
      `)
      .eq('type', educationType.id);

    if (error) {
      console.error('Error fetching schools:', error);
    } else {
      schoolsData = data || [];
    }
  } else {
    console.error("Could not find 'education' in organisation_types table.");
  }
  
  // Fetch admin users (user_type 7) who are NOT linked to any organization yet.
  const { data: allAdmins, error: usersError } = await supabase.from('user').select('id, name, email').eq('user_type', 7).order('name');
  if (usersError) {
      console.error("Error fetching education admin users:", usersError);
  }

  const { data: assignedLinks, error: linksError } = await supabase.from('user_organisations').select('user_id');
  if(linksError) {
      console.error("Error fetching assigned user links:", linksError);
  }
  const assignedUserIds = new Set((assignedLinks || []).map(link => link.user_id));

  const unassignedAdmins = (allAdmins || []).filter(admin => !assignedUserIds.has(admin.id));
  
  return <SchoolsClientPage schools={schoolsData} users={unassignedAdmins as User[]} />;
}
