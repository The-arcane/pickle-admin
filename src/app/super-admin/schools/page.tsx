
import { createServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { SchoolsClientPage } from './client';

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
  
  // Fetch Education Admin users (user_type 7) who are NOT linked to any organization yet.
  const { data: usersData, error: usersError } = await supabase
    .from('user')
    .select('id, name, email, user_organisations!left(user_id)')
    .eq('user_type', 7)
    .is('user_organisations.user_id', null)
    .order('name');
  
  if (usersError) {
      console.error("Error fetching unassigned education admin users:", usersError);
  }
  
  return <SchoolsClientPage schools={schoolsData} users={usersData || []} />;
}
