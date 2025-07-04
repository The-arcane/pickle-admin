import { createServer } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { EditCourtClientPage } from './client';
import type { Court } from './types';

export default async function EditCourtPage({ params }: { params: { id: string } }) {
  const supabase = createServer();
  const { id } = params;
  const isAdding = id === 'add';

  let court: Court | null = null;
  if (!isAdding) {
    const { data: courtData, error: courtError } = await supabase
      .from('courts')
      .select('*, organisations(name, address), sports(name, max_players)')
      .eq('id', id)
      .single();
    
    if (courtError || !courtData) {
      notFound();
    }
    
    court = {
      id: courtData.id,
      name: courtData.name,
      address: courtData.address,
      organisation_id: courtData.organisation_id,
      sport_id: courtData.sport_id,
      lat: courtData.lat,
      lng: courtData.lng,
      // The following are mock values based on the design as they don't exist in the schema
      venue_name: courtData.organisations?.name || 'N/A',
      venue_address: courtData.organisations?.address || '',
      sports_type: courtData.sports?.name || 'N/A',
      max_players: courtData.sports?.max_players || 0,
      audience_capacity: 7850, // Mock data
      court_type: ['Indoor', 'VIP'], // Mock data
      tags: ['Indoor', 'VIP'], // Mock data
      equipment_rental: true, // Mock data
      description: 'Pickelball Academy is a renowned sports facility situated in Ladha Sarai Village, Delhi with a commitment to providing high-quality services, we offers a range of amenities and equipment to support athletes in their treining and development.', // Mock data
      labels: ['Label', 'Label', 'Label', 'Label'], // Mock data
      facilities: ['Water', 'Restrooms'], // Mock data
    };
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
