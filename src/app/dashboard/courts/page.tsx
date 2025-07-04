import { createServer } from '@/lib/supabase/server';
import { CourtsClientPage } from './client';

export default async function CourtListPage() {
  const supabase = createServer();

  // Fetch all data needed for the courts page, including relations for editing.
  const { data: courtsData, error: courtsError } = await supabase
    .from('courts')
    .select('*, organisations(name), sports(name, max_players)');

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
