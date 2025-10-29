
import { createServer } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { EditCourtClientPage } from './client';
import type { Court } from './types';

export default async function EditCourtPage({ params }: { params: { id: string } }) {
  const supabase = await createServer();
  const { id } = params;
  const isAdding = id === 'add';

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
      return redirect('/login?error=Could not determine your organization.');
  }

  const { data: orgLink } = await supabase
    .from('user_organisations')
    .select('organisation_id')
    .eq('user_id', userRecord.id)
    .single();
  
  if (!orgLink?.organisation_id) {
    return redirect('/livingspace?error=Your%20account%20is%20not%20associated%20with%20an%20organization.');
  }
  const organisationId = orgLink.organisation_id;

  let court: Court | null = null;
  if (!isAdding) {
    const { data: courtData, error: courtError } = await supabase
      .from('courts')
      .select(`
        *,
        organisations(*),
        sports(*),
        court_rules(*),
        court_contacts(*),
        availability_blocks(*),
        recurring_unavailability(*),
        court_gallery(*)
      `)
      .eq('id', id)
      .eq('organisation_id', organisationId) // Ensure user can only edit courts in their org
      .single();
    
    if (courtError || !courtData) {
      console.error('Error fetching court details:', courtError);
      notFound();
    }
    
    court = courtData as Court;
  }
  
  // We only need the single organisation for this admin
  const { data: organisationData, error: orgsError } = await supabase
    .from('organisations')
    .select('id, name, address')
    .eq('id', organisationId)
    .single();

  const { data: sportsData, error: sportsError } = await supabase.from('sports').select('id, name');

  if (orgsError || sportsError) {
    console.error("Error fetching data for court form", orgsError || sportsError);
  }

  return (
    <EditCourtClientPage
      court={court}
      organisation={organisationData || null} // Pass single organisation
      sports={sportsData || []}
      organisationId={organisationId}
    />
  );
}
