'use server';

import { createServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { CourtRule, CourtGalleryImage, CourtContact } from './[id]/types';

function getCourtDataFromFormData(formData: FormData) {
    return {
        name: formData.get('name') as string,
        address: formData.get('address') as string,
        organisation_id: Number(formData.get('organisation_id')),
        sport_id: Number(formData.get('sport_id')),
        description: formData.get('description') as string,
        max_players: formData.get('max_players') ? Number(formData.get('max_players')) : null,
        audience_capacity: formData.get('audience_capacity') ? Number(formData.get('audience_capacity')) : null,
        is_equipment_available: formData.get('is_equipment_available') === 'true',
        surface: formData.get('surface') as string,
        has_floodlights: formData.get('has_floodlights') === 'true',
        price: formData.get('price') ? Number(formData.get('price')) : null,
        discount: formData.get('discount') ? Number(formData.get('discount')) : null,
        image: formData.get('image') as string,
        cover_image: formData.get('cover_image') as string,
        feature: formData.get('feature') as string,
        badge_type: formData.get('badge_type') as string,
    };
}


export async function addCourt(formData: FormData) {
  const supabase = createServer();
  const courtData = getCourtDataFromFormData(formData);

  if (!courtData.name || !courtData.organisation_id || !courtData.sport_id) {
    return { error: 'Court Name, Venue, and Sport Type are required.' };
  }

  // --- 1. Insert the main court record ---
  const { data: newCourt, error: courtError } = await supabase
    .from('courts')
    .insert({ ...courtData, lat: 0, lng: 0 }) // Add placeholder lat/lng
    .select()
    .single();

  if (courtError || !newCourt) {
    console.error('Error adding court:', courtError);
    return { error: 'Failed to add court.' };
  }
  
  const courtId = newCourt.id;

  // --- 2. Handle related tables ---
  const rules = JSON.parse(formData.get('rules') as string) as Partial<CourtRule>[];
  const gallery = JSON.parse(formData.get('gallery') as string) as Partial<CourtGalleryImage>[];
  const contact = JSON.parse(formData.get('contact') as string) as Partial<CourtContact>;
  let anyError = false;

  if (rules.length > 0) {
    const rulesToInsert = rules.map(r => ({ ...r, court_id: courtId }));
    const { error } = await supabase.from('court_rules').insert(rulesToInsert);
    if(error) { console.error('Error adding rules:', error); anyError = true; }
  }
  if (gallery.length > 0) {
    const galleryToInsert = gallery.map(g => ({ ...g, court_id: courtId }));
    const { error } = await supabase.from('court_gallery').insert(galleryToInsert);
    if(error) { console.error('Error adding gallery:', error); anyError = true; }
  }
  if (contact.phone || contact.email) {
    const { error } = await supabase.from('court_contacts').insert({ ...contact, court_id: courtId });
    if(error) { console.error('Error adding contact:', error); anyError = true; }
  }

  if (anyError) {
      return { error: 'Court was added, but failed to add some related details.' };
  }

  revalidatePath('/dashboard/courts');
  redirect('/dashboard/courts');
}

export async function updateCourt(formData: FormData) {
  const supabase = createServer();
  const id = Number(formData.get('id'));
  const courtData = getCourtDataFromFormData(formData);
  
  const rules = JSON.parse(formData.get('rules') as string) as Partial<CourtRule>[];
  const gallery = JSON.parse(formData.get('gallery') as string) as Partial<CourtGalleryImage>[];
  const contact = JSON.parse(formData.get('contact') as string) as Partial<CourtContact>;

  if (!id) return { error: 'Court ID is missing.' };
  if (!courtData.name || !courtData.organisation_id || !courtData.sport_id) {
    return { error: 'Court Name, Venue, and Sport Type are required.' };
  }

  // --- 1. Update main court table ---
  const { error: courtError } = await supabase.from('courts').update(courtData).eq('id', id);
  if (courtError) { console.error('Error updating court:', courtError); return { error: 'Failed to update court.' };}

  // --- 2. Sync Rules (Delete removed, then upsert all) ---
  const { data: existingRules } = await supabase.from('court_rules').select('id').eq('court_id', id);
  const existingRuleIds = existingRules?.map(r => r.id) ?? [];
  const newRuleIds = rules.map(r => r.id).filter(Boolean);
  const rulesToDelete = existingRuleIds.filter(id => !newRuleIds.includes(id));
  
  if (rulesToDelete.length > 0) {
      await supabase.from('court_rules').delete().in('id', rulesToDelete);
  }
  if(rules.length > 0) {
    const rulesToUpsert = rules.map(r => ({ ...r, court_id: id }));
    await supabase.from('court_rules').upsert(rulesToUpsert);
  }
  
  // --- 3. Sync Gallery (similar to rules) ---
  const { data: existingGallery } = await supabase.from('court_gallery').select('id').eq('court_id', id);
  const existingGalleryIds = existingGallery?.map(g => g.id) ?? [];
  const newGalleryIds = gallery.map(g => g.id).filter(Boolean);
  const galleryToDelete = existingGalleryIds.filter(id => !newGalleryIds.includes(id));
  
  if(galleryToDelete.length > 0) {
      await supabase.from('court_gallery').delete().in('id', galleryToDelete);
  }
  if(gallery.length > 0) {
    const galleryToUpsert = gallery.map(g => ({ ...g, court_id: id }));
    await supabase.from('court_gallery').upsert(galleryToUpsert);
  }

  // --- 4. Sync Contact ---
  if(contact.id || contact.phone || contact.email) {
    await supabase.from('court_contacts').upsert({ ...contact, court_id: id });
  }

  revalidatePath('/dashboard/courts');
  revalidatePath(`/dashboard/courts/${id}`);
  redirect('/dashboard/courts');
}
