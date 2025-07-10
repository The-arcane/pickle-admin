
import { createServer } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { EditCourtClientPage } from './client';
import type { Court } from './types';

export default async function EditCourtPage({ params }: { params: { id: string } }) {
  const supabase = await createServer();
  const { id } = params;
  const isAdding = id === 'add';

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
      .single();
    
    if (courtError || !courtData) {
      console.error('Error fetching court details:', courtError);
      notFound();
    }
    
    court = courtData as Court;
  }
  
  const { data: organisationsData, error: orgsError } = await supabase.from('organisations').select('id, name, address');
  const { data: sportsData, error: sportsError } = await supabase.from('sports').select('id, name');

  if (orgsError || sportsError) {
    console.error("Error fetching data for court form", orgsError || sportsError);
  }

  return (
    <EditCourtClientPage
      court={court}
      organisations={organisationsData || []}
      sports={sportsData || []}
    />
  );
}
