'use server';

import { createServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateCourt(formData: FormData) {
  const supabase = createServer();
  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const organisation_id = formData.get('organisation_id') as string;
  const sport_id = formData.get('sport_id') as string;


  if (!id) {
    return { error: 'Court ID is missing.' };
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
  return { success: true };
}
