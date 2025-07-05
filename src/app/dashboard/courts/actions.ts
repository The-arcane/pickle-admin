'use server';

import { createServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

function getCourtDataFromFormData(formData: FormData) {
    const name = formData.get('name') as string;
    const address = formData.get('address') as string;
    const organisation_id = formData.get('organisation_id') as string;
    const sport_id = formData.get('sport_id') as string;
    const description = formData.get('description') as string;
    const max_players = formData.get('max_players') as string;
    const audience_capacity = formData.get('audience_capacity') as string;
    const is_equipment_available = formData.get('is_equipment_available') === 'true';
    const surface = formData.get('surface') as string;
    const has_floodlights = formData.get('has_floodlights') === 'true';

    return {
        name,
        address,
        organisation_id: Number(organisation_id),
        sport_id: Number(sport_id),
        description,
        max_players: max_players ? Number(max_players) : null,
        audience_capacity: audience_capacity ? Number(audience_capacity) : null,
        is_equipment_available,
        surface,
        has_floodlights,
    };
}


export async function addCourt(formData: FormData) {
  const supabase = createServer();
  const courtData = getCourtDataFromFormData(formData);

  if (!courtData.name || !courtData.organisation_id || !courtData.sport_id) {
    return { error: 'Court Name, Venue, and Sport Type are required.' };
  }

  // Lat and lng are required by the schema, but we don't have them in the form.
  // We'll add placeholder values for now.
  const dataToInsert = {
    ...courtData,
    lat: 0,
    lng: 0,
  };


  const { error } = await supabase
    .from('courts')
    .insert(dataToInsert);

  if (error) {
    console.error('Error adding court:', error);
    return { error: 'Failed to add court.' };
  }
  
  // Note: Saving related data (amenities, gallery, etc.) is more complex
  // and would typically be handled in a separate step or database function.

  revalidatePath('/dashboard/courts');
  redirect('/dashboard/courts');
}

export async function updateCourt(formData: FormData) {
  const supabase = createServer();
  const id = formData.get('id') as string;
  const courtData = getCourtDataFromFormData(formData);

  if (!id) {
    return { error: 'Court ID is missing.' };
  }
  
  if (!courtData.name || !courtData.organisation_id || !courtData.sport_id) {
    return { error: 'Court Name, Venue, and Sport Type are required.' };
  }

  const { error } = await supabase
    .from('courts')
    .update(courtData)
    .eq('id', Number(id));

  if (error) {
    console.error('Error updating court:', error);
    return { error: 'Failed to update court.' };
  }

  // Note: Saving related data (amenities, gallery, etc.) is more complex
  // and would typically be handled in a separate step or database function.

  revalidatePath('/dashboard/courts');
  revalidatePath(`/dashboard/courts/${id}`);
  redirect('/dashboard/courts');
}
