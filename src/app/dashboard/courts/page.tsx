import { createServer } from '@/lib/supabase/server';
import { CourtsClientPage } from './client';
import { redirect } from 'next/navigation';

export default async function CourtListPage() {
  const supabase = createServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/login');
  }

  const { data: userRecord } = await supabase
    .from('user')
    .select('id')
    .eq('user_uuid', user.id)
    .single();

  if (!userRecord) {
    return redirect('/login');
  }
  
  const { data: orgLink } = await supabase
    .from('user_organisations')
    .select('organisation_id')
    .eq('user_id', userRecord.id)
    .maybeSingle();

  const organisationId = orgLink?.organisation_id;

  if (!organisationId) {
    return (
        <div className="flex flex-col items-center justify-center h-full">
            <p className="text-muted-foreground">You are not associated with an organization.</p>
        </div>
    );
  }

  // Fetch all data needed for the courts page, including relations for editing.
  const { data: courtsData, error: courtsError } = await supabase
    .from('courts')
    .select('*, organisations(name), sports(name, max_players)')
    .eq('organisation_id', organisationId);

  // Fetch all orgs and sports for the "add/edit" form dropdowns.
  // Note: For a stricter multi-tenant app, you might only fetch the current org.
  // But for a dropdown, showing all possible sports might be intended.
  const { data: organisationsData, error: orgsError } = await supabase.from('organisations').select('id, name');
  const { data: sportsData, error: sportsError } = await supabase.from('sports').select('id, name');
  
  if (courtsError || orgsError || sportsError) {
    console.error('Error fetching court data:', courtsError || orgsError || sportsError);
  }
  
  // Mock statuses for the UI as it's not in the DB schema
  const statuses = ['Open', 'Closed', 'Maintenance'];

  const courts = courtsData?.map((c, index) => ({
      id: c.id,
      name: c.name,
      venue: c.organisations?.name || 'N/A',
      type: c.sports?.name || 'N/A',
      max_players: c.sports?.max_players || 'N/A',
      organisation_id: c.organisation_id,
      sport_id: c.sport_id,
      status: statuses[index % statuses.length], // Assign a status cyclically for demo
  })) || [];

  const organisations = organisationsData || [];
  const sports = sportsData || [];

  return <CourtsClientPage courts={courts} organisations={organisations} sports={sports} />;
}
