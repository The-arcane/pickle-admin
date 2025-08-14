
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
      .eq('"Type"', educationType.id);

    if (error) {
      console.error('Error fetching schools:', error);
    } else {
      schoolsData = data || [];
    }
  } else {
    console.error("Could not find 'education' in organisation_types table.");
  }
  
  const { data: orgTypesData, error: orgTypesError } = await supabase
    .from('organisation_types')
    .select('id, type_name');
    
  if (orgTypesError) {
      console.error("Error fetching org types", orgTypesError)
  }

  return <SchoolsClientPage schools={schoolsData} orgTypes={orgTypesData || []} />;
}
