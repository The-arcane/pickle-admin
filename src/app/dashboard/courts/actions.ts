'use server';

import { createServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function addCourt(formData: FormData) {
  const supabase = createServer();
  const name = formData.get('name') as string;
  const organisation_id = formData.get('organisation_id') as string;
  const sport_id = formData.get('sport_id') as string;
  
  // The following fields are collected from the form but not yet
  // saved to the database. They can be added to the `insert` call
  // once the database schema is updated.
  const address = formData.get('address') as string;
  const max_players = formData.get('max_players') as string;
  const audience_capacity = formData.get('audience_capacity') as string;
  const description = formData.get('description') as string;
  const court_type = formData.get('court_type') as string; // JSON string
  const tags = formData.get('tags') as string; // JSON string
  const equipment_rental = formData.get('equipment_rental') as string; // 'true' or 'false'
  const facilities = formData.get('facilities') as string; // JSON string
  const blackout_dates = formData.get('blackout_dates') as string; // JSON string of dates

  if (!name || !organisation_id || !sport_id) {
    return { error: 'Court Name, Venue, and Sport Type are required.' };
  }

  const { error } = await supabase
    .from('courts')
    .insert({
      name,
      organisation_id: Number(organisation_id),
      sport_id: Number(sport_id),
    });

  if (error) {
    console.error('Error adding court:', error);
    return { error: 'Failed to add court.' };
  }

  revalidatePath('/dashboard/courts');
  redirect('/dashboard/courts');
}

export async function updateCourt(formData: FormData) {
  const supabase = createServer();
  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const organisation_id = formData.get('organisation_id') as string;
  const sport_id = formData.get('sport_id') as string;

  // The following fields are collected from the form but not yet
  // saved to the database. They can be added to the `update` call
  // once the database schema is updated.
  const address = formData.get('address') as string;
  const max_players = formData.get('max_players') as string;
  const audience_capacity = formData.get('audience_capacity') as string;
  const description = formData.get('description') as string;
  const court_type = formData.get('court_type') as string; // JSON string
  const tags = formData.get('tags') as string; // JSON string
  const equipment_rental = formData.get('equipment_rental') as string; // 'true' or 'false'
  const facilities = formData.get('facilities') as string; // JSON string
  const blackout_dates = formData.get('blackout_dates') as string; // JSON string of dates

  if (!id) {
    return { error: 'Court ID is missing.' };
  }
  
  if (!name || !organisation_id || !sport_id) {
    return { error: 'Court Name, Venue, and Sport Type are required.' };
  }

  const { error } = await supabase
    .from('courts')
    .update({ 
      name,
      organisation_id: Number(organisation_id),
      sport_id: Number(sport_id),
     })
    .eq('id', Number(id));

  if (error) {
    console.error('Error updating court:', error);
    return { error: 'Failed to update court.' };
  }

  revalidatePath('/dashboard/courts');
  redirect('/dashboard/courts');
}
