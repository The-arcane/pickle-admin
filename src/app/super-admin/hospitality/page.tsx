import { createServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { HospitalityClientPage } from './client';

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
  
  return <HospitalityClientPage orgs={orgsData} />;
}
