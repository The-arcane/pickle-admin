
import { createServer } from '@/lib/supabase/server';
import { CourtsClientPage } from './client';
import { redirect } from 'next/navigation';

export default async function ArenaCourtsPage() {
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

  if (!userRecord) {
    return redirect('/login?type=arena&error=Your%20account%20is%20not%20found.');
  }

  const { data: orgLink } = await supabase
    .from('user_organisations')
    .select('organisation_id')
    .eq('user_id', userRecord.id)
    .maybeSingle();

  if (!orgLink?.organisation_id) {
    return redirect('/login?type=arena&error=Your%20account%20is%20not%20associated%20with%20an%20organization.');
  }
  const organisationId = orgLink.organisation_id;

  const { data: courtsData, error: courtsError } = await supabase
    .from('courts')
    .select('*, organisations(name), sports(name), status:court_avaliablity_status(id, label)')
    .eq('organisation_id', organisationId);

  const { data: organisationsData, error: orgsError } = await supabase.from('organisations').select('id, name').eq('id', organisationId);
  const { data: sportsData, error: sportsError } = await supabase.from('sports').select('id, name');
  
  if (courtsError || orgsError || sportsError) {
    console.error('Error fetching court data:', courtsError || orgsError || sportsError);
  }

  const courts = courtsData?.map((c) => ({
      id: c.id,
      name: c.name,
      venue: c.organisations?.name ?? 'N/A',
      type: c.sports?.name ?? 'N/A',
      max_players: c.max_players,
      organisation_id: c.organisation_id,
      sport_id: c.sport_id,
      status: c.status?.label || 'Unknown',
      is_public: c.is_public,
  })) || [];

  const organisations = organisationsData ? [organisationsData] : [];
  const sports = sportsData || [];

  return <CourtsClientPage courts={courts} organisations={organisations} sports={sports} />;
}
