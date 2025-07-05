'use server';

import { createServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { CourtRule, CourtGalleryImage, CourtContact, AvailabilityBlock, RecurringUnavailability } from './[id]/types';

function getCourtDataFromFormData(formData: FormData) {
    return {
        name: formData.get('name') as string,
        address: formData.get('address') as string,
        lat: Number(formData.get('lat')),
        lng: Number(formData.get('lng')),
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
        c_start_time: formData.get('c_start_time') || null,
        c_end_time: formData.get('c_end_time') || null,
    };
}


export async function addCourt(formData: FormData) {
  const supabase = createServer();
  
  try {
    const courtData = getCourtDataFromFormData(formData);

    if (!courtData.name || !courtData.organisation_id || !courtData.sport_id) {
      return { error: 'Court Name, Venue, and Sport Type are required.' };
    }
    if (courtData.lat === null || courtData.lng === null || isNaN(courtData.lat) || isNaN(courtData.lng)) {
      return { error: 'Valid Latitude and Longitude are required.' };
    }

    // --- 1. Insert the main court record ---
    const { data: newCourt, error: courtError } = await supabase
      .from('courts')
      .insert(courtData)
      .select()
      .single();

    if (courtError || !newCourt) {
      console.error('Error adding court:', courtError);
      return { error: `Failed to add court. ${courtError?.message}` };
    }
    
    const courtId = newCourt.id;

    // --- 2. Handle related tables ---
    const rules = JSON.parse(formData.get('rules') as string) as Partial<CourtRule>[];
    const gallery = JSON.parse(formData.get('gallery') as string) as Partial<CourtGalleryImage>[];
    const contact = JSON.parse(formData.get('contact') as string) as Partial<CourtContact>;
    const availability = JSON.parse(formData.get('availability') as string) as Partial<AvailabilityBlock>[];
    const unavailability = JSON.parse(formData.get('unavailability') as string) as Partial<RecurringUnavailability>[];


    if (rules.length > 0) {
      const rulesToInsert = rules.map(r => ({ rule: r.rule, court_id: courtId }));
      const { error } = await supabase.from('court_rules').insert(rulesToInsert);
      if(error) { console.error('Error adding rules:', error); return { error: `Failed to save rules: ${error.message}` }; }
    }
    if (gallery.length > 0) {
      const galleryToInsert = gallery.map(g => ({ image_url: g.image_url, court_id: courtId }));
      const { error } = await supabase.from('court_gallery').insert(galleryToInsert);
      if(error) { console.error('Error adding gallery:', error); return { error: `Failed to save gallery: ${error.message}` };}
    }
    if (contact.phone || contact.email) {
      const { error } = await supabase.from('court_contacts').insert({ ...contact, court_id: courtId });
      if(error) { console.error('Error adding contact:', error); return { error: `Failed to save contact info: ${error.message}` };}
    }
    if (availability.length > 0) {
      const availabilityToInsert = availability.map(a => ({ ...a, court_id: courtId }));
      const { error } = await supabase.from('availability_blocks').insert(availabilityToInsert);
      if(error) { console.error('Error adding availability:', error); return { error: `Failed to save availability: ${error.message}` };}
    }
    if (unavailability.length > 0) {
      const unavailabilityToInsert = unavailability.map(u => ({ ...u, court_id: courtId }));
      const { error } = await supabase.from('recurring_unavailability').insert(unavailabilityToInsert);
      if(error) { console.error('Error adding unavailability:', error); return { error: `Failed to save recurring unavailability: ${error.message}` };}
    }


  } catch (e: any) {
    console.error('Server action error in addCourt:', e);
    return { error: `An unexpected error occurred: ${e.message}` };
  }

  revalidatePath('/dashboard/courts');
  return { success: true };
}

export async function updateCourt(formData: FormData) {
  const supabase = createServer();
  const id = Number(formData.get('id'));

  try {
    const courtData = getCourtDataFromFormData(formData);
    
    const rules = JSON.parse(formData.get('rules') as string) as Partial<CourtRule>[];
    const gallery = JSON.parse(formData.get('gallery') as string) as Partial<CourtGalleryImage>[];
    const contact = JSON.parse(formData.get('contact') as string) as Partial<CourtContact>;
    const availability = JSON.parse(formData.get('availability') as string) as Partial<AvailabilityBlock>[];
    const unavailability = JSON.parse(formData.get('unavailability') as string) as Partial<RecurringUnavailability>[];


    if (!id) return { error: 'Court ID is missing.' };
    if (!courtData.name || !courtData.organisation_id || !courtData.sport_id) {
      return { error: 'Court Name, Venue, and Sport Type are required.' };
    }

    // --- 1. Update main court table ---
    const { error: courtError } = await supabase.from('courts').update(courtData).eq('id', id);
    if (courtError) { console.error('Error updating court:', courtError); return { error: `Failed to update court. ${courtError.message}` };}

    // --- 2. Sync Rules (Delete removed, then upsert all) ---
    const { data: existingRules } = await supabase.from('court_rules').select('id').eq('court_id', id);
    if (!existingRules) { return { error: "Could not fetch existing court rules." }; }
    const existingRuleIds = existingRules.map(r => r.id);
    const newRuleIds = rules.map(r => r.id).filter(Boolean);
    const rulesToDelete = existingRuleIds.filter(ruleId => !newRuleIds.includes(ruleId as number));
    
    if (rulesToDelete.length > 0) {
        const { error } = await supabase.from('court_rules').delete().in('id', rulesToDelete);
        if (error) { console.error('Error deleting rules:', error); return { error: `Failed to delete old rules: ${error.message}` }; }
    }
    if(rules.length > 0) {
      const rulesToUpsert = rules.map(r => {
        const record: any = { rule: r.rule, court_id: id };
        if (r.id) record.id = r.id;
        return record;
      });
      const { error } = await supabase.from('court_rules').upsert(rulesToUpsert);
      if (error) { console.error('Error upserting rules:', error); return { error: `Failed to save rules: ${error.message}` }; }
    }
    
    // --- 3. Sync Gallery (similar to rules) ---
    const { data: existingGallery } = await supabase.from('court_gallery').select('id').eq('court_id', id);
    if (!existingGallery) { return { error: "Could not fetch existing gallery." }; }
    const existingGalleryIds = existingGallery.map(g => g.id);
    const newGalleryIds = gallery.map(g => g.id).filter(Boolean);
    const galleryToDelete = existingGalleryIds.filter(galleryId => !newGalleryIds.includes(galleryId as number));
    
    if(galleryToDelete.length > 0) {
        const { error } = await supabase.from('court_gallery').delete().in('id', galleryToDelete);
        if (error) { console.error('Error deleting gallery images:', error); return { error: `Failed to delete old gallery images: ${error.message}` }; }
    }
    if(gallery.length > 0) {
      const galleryToUpsert = gallery.map(g => {
        const record: any = { image_url: g.image_url, court_id: id };
        if (g.id) record.id = g.id;
        return record;
      });
      const { error } = await supabase.from('court_gallery').upsert(galleryToUpsert);
      if (error) { console.error('Error upserting gallery:', error); return { error: `Failed to save gallery: ${error.message}` }; }
    }

    // --- 4. Sync Contact ---
    const { data: existingContact } = await supabase.from('court_contacts').select('id').eq('court_id', id).maybeSingle();
    const hasNewContactInfo = contact.phone || contact.email;
    
    if (hasNewContactInfo) {
        const contactData: any = { ...contact, court_id: id };
        if (existingContact?.id) {
          contactData.id = existingContact.id;
        }
        const { error } = await supabase.from('court_contacts').upsert(contactData);
        if (error) { console.error('Error upserting contact:', error); return { error: `Failed to save contact info: ${error.message}` }; }
    } else if (existingContact) {
      const { error } = await supabase.from('court_contacts').delete().eq('id', existingContact.id);
      if (error) { console.error('Error deleting contact:', error); return { error: `Failed to delete old contact info: ${error.message}` }; }
    }

    // --- 5. Sync Availability Blocks ---
    const { data: existingAvailability } = await supabase.from('availability_blocks').select('id').eq('court_id', id);
    if (!existingAvailability) { return { error: "Could not fetch existing availability." }; }
    const existingAvailabilityIds = existingAvailability.map(a => a.id);
    const newAvailabilityIds = availability.map(a => a.id).filter(Boolean);
    const availabilityToDelete = existingAvailabilityIds.filter(aId => !newAvailabilityIds.includes(aId as number));

    if (availabilityToDelete.length > 0) {
        const { error } = await supabase.from('availability_blocks').delete().in('id', availabilityToDelete);
        if (error) { console.error('Error deleting availability:', error); return { error: `Failed to delete old availability blocks: ${error.message}` }; }
    }
    if(availability.length > 0) {
      const availabilityToUpsert = availability.map(a => {
        const record: any = { court_id: id, date: a.date, start_time: a.start_time, end_time: a.end_time, reason: a.reason };
        if (a.id) record.id = a.id;
        return record;
      });
      const { error } = await supabase.from('availability_blocks').upsert(availabilityToUpsert);
      if (error) { console.error('Error upserting availability:', error); return { error: `Failed to save availability: ${error.message}` }; }
    }
    
    // --- 6. Sync Recurring Unavailability ---
    const { data: existingUnavailability } = await supabase.from('recurring_unavailability').select('id').eq('court_id', id);
    if (!existingUnavailability) { return { error: "Could not fetch existing recurring unavailability." }; }
    const existingUnavailabilityIds = existingUnavailability.map(u => u.id);
    const newUnavailabilityIds = unavailability.map(u => u.id).filter(Boolean);
    const unavailabilityToDelete = existingUnavailabilityIds.filter(uId => !newUnavailabilityIds.includes(uId as number));
    
    if(unavailabilityToDelete.length > 0) {
        const { error } = await supabase.from('recurring_unavailability').delete().in('id', unavailabilityToDelete);
        if (error) { console.error('Error deleting recurring unavailability:', error); return { error: `Failed to delete old recurring unavailability: ${error.message}` }; }
    }
    if(unavailability.length > 0) {
      const unavailabilityToUpsert = unavailability.map(u => {
        const record: any = { court_id: id, day_of_week: u.day_of_week, start_time: u.start_time, end_time: u.end_time, reason: u.reason, active: u.active ?? true };
        if (u.id) record.id = u.id;
        return record;
      });
      const { error } = await supabase.from('recurring_unavailability').upsert(unavailabilityToUpsert);
      if (error) { console.error('Error upserting recurring unavailability:', error); return { error: `Failed to save recurring unavailability: ${error.message}` }; }
    }


  } catch (e: any) {
    console.error('Server action error in updateCourt:', e);
    return { error: `An unexpected error occurred: ${e.message}` };
  }

  revalidatePath('/dashboard/courts');
  revalidatePath(`/dashboard/courts/${id}`);
  return { success: true };
}
