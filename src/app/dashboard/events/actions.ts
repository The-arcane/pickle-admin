'use server';

import { createServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { SubEvent, GalleryImage, WhatToBringItem, EventCategory, EventTag } from './[id]/types';

// Helper to upload a file to Supabase Storage for events
async function handleEventImageUpload(supabase: any, file: File | null, eventId: string): Promise<string | null> {
    if (!file || file.size === 0) {
        return null;
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `cover-${Date.now()}.${fileExt}`;
    // Store images in a public folder, organized by event ID
    const filePath = `public/${eventId}/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
        .from('events') // The new bucket name
        .upload(filePath, file);

    if (uploadError) {
        console.error(`Error uploading event cover image:`, uploadError);
        throw new Error(`Upload failed for ${file.name}: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabase.storage
        .from('events')
        .getPublicUrl(filePath);
    
    return publicUrlData.publicUrl;
}


function getEventDataFromFormData(formData: FormData) {
    const isFree = formData.get('is_free') === 'true';
    const startTime = formData.get('start_time') as string;
    const endTime = formData.get('end_time') as string;
    
    const organiserId = formData.get('organiser_org_id');
    const lat = formData.get('latitude');
    const lng = formData.get('longitude');
    const amount = formData.get('amount');
    const maxCapacity = formData.get('max_total_capacity');

    return {
        title: formData.get('title') as string,
        slug: (formData.get('title') as string).toLowerCase().replace(/\s+/g, '-'),
        description: formData.get('description') as string,
        type: formData.get('type') as string,
        access_type: formData.get('access_type') as string,
        organiser_org_id: organiserId ? Number(organiserId) : null,
        start_time: startTime ? new Date(startTime).toISOString() : null,
        end_time: endTime ? new Date(endTime).toISOString() : null,
        timezone: formData.get('timezone') as string,
        location_name: formData.get('location_name') as string,
        address: formData.get('address') as string,
        latitude: lat ? Number(lat) : null,
        longitude: lng ? Number(lng) : null,
        is_family_friendly: formData.get('is_family_friendly') === 'on',
        is_outdoor: formData.get('is_outdoor') === 'on',
        has_parking: formData.get('has_parking') === 'on',
        is_accessible: formData.get('is_accessible') === 'on',
        pets_allowed: formData.get('pets_allowed') === 'on',
        security_on_site: formData.get('security_on_site') === 'on',
        is_free: isFree,
        currency: isFree ? null : formData.get('currency') as string,
        amount: isFree ? null : (amount ? Number(amount) : null),
        pricing_notes: formData.get('pricing_notes') as string,
        video_url: formData.get('video_url') as string,
        max_total_capacity: maxCapacity ? Number(maxCapacity) : null,
    };
}

export async function addEvent(formData: FormData) {
  const supabase = createServer();
  
  try {
    const eventData = getEventDataFromFormData(formData);
    
    // --- 1. Insert the main event record (without image first) ---
    const { data: newEvent, error: eventError } = await supabase
      .from('events')
      .insert(eventData)
      .select()
      .single();

    if (eventError || !newEvent) {
      console.error('Error adding event:', eventError);
      return { error: `Failed to add event. ${eventError?.message}` };
    }
    
    const eventId = newEvent.id;
    const eventUpdateData: { cover_image?: string } = {};

    // --- 2. Upload image and prepare update payload ---
    const coverImageFile = formData.get('cover_image_file') as File | null;
    const coverImageUrl = await handleEventImageUpload(supabase, coverImageFile, eventId.toString());
    if (coverImageUrl) eventUpdateData.cover_image = coverImageUrl;
    
    // --- 3. Update event with image URL if it was uploaded ---
    if (Object.keys(eventUpdateData).length > 0) {
        const { error: imageUpdateError } = await supabase
            .from('events')
            .update(eventUpdateData)
            .eq('id', eventId);
        if (imageUpdateError) {
            console.error('Error updating event with image:', imageUpdateError);
            return { error: `Event added, but failed to save cover image: ${imageUpdateError.message}` };
        }
    }


    // --- 4. Handle related tables ---
    const subEvents = JSON.parse(formData.get('sub_events') as string) as Partial<SubEvent>[];
    const gallery = JSON.parse(formData.get('gallery') as string) as Partial<GalleryImage>[];
    const whatToBring = JSON.parse(formData.get('what_to_bring') as string) as Partial<WhatToBringItem>[];

    if (subEvents.length > 0) {
      const mainEventDateString = eventData.start_time ? new Date(eventData.start_time).toISOString().split('T')[0] : null;
      const createTimestamp = (timeStr: string | null | undefined) => !timeStr || !mainEventDateString ? null : new Date(`${mainEventDateString}T${timeStr}:00.000Z`).toISOString();
      
      const toInsert = subEvents.map(item => ({ 
          event_id: eventId,
          title: item.title || null,
          start_time: createTimestamp(item.start_time),
          end_time: createTimestamp(item.end_time),
      }));
      const { error } = await supabase.from('event_sub_events').insert(toInsert);
      if(error) { console.error('Error adding sub-events:', error); return { error: `Failed to save sub-events: ${error.message}` }; }
    }
    if (gallery.length > 0) {
      const toInsert = gallery.map(item => ({ image_url: item.image_url, event_id: eventId }));
      const { error } = await supabase.from('event_gallery_images').insert(toInsert);
      if(error) { console.error('Error adding gallery:', error); return { error: `Failed to save gallery: ${error.message}` };}
    }
    if (whatToBring.length > 0) {
      const toInsert = whatToBring.map(item => ({ item: item.item, event_id: eventId }));
      const { error } = await supabase.from('event_what_to_bring').insert(toInsert);
      if(error) { console.error('Error adding what to bring:', error); return { error: `Failed to save what to bring list: ${error.message}` };}
    }

  } catch (e: any) {
    console.error('Server action error in addEvent:', e);
    return { error: `An unexpected error occurred: ${e.message}` };
  }

  revalidatePath('/dashboard/events');
  return { success: true };
}

export async function updateEvent(formData: FormData) {
  const supabase = createServer();
  const id = Number(formData.get('id'));

  try {
    if (!id) return { error: 'Event ID is missing.' };
    
    const eventUpdateData = getEventDataFromFormData(formData) as any;
    
    // --- Handle Image Upload ---
    const coverImageFile = formData.get('cover_image_file') as File | null;
    const coverImageUrl = await handleEventImageUpload(supabase, coverImageFile, id.toString());
    if (coverImageUrl) eventUpdateData.cover_image = coverImageUrl;


    // --- 1. Update main event table ---
    const { error: eventError } = await supabase.from('events').update(eventUpdateData).eq('id', id);
    if (eventError) { console.error('Error updating event:', eventError); return { error: `Failed to update event. ${eventError.message}` };}

    const subEvents = JSON.parse(formData.get('sub_events') as string) as Partial<SubEvent>[];
    const gallery = JSON.parse(formData.get('gallery') as string) as Partial<GalleryImage>[];
    const whatToBring = JSON.parse(formData.get('what_to_bring') as string) as Partial<WhatToBringItem>[];

    // --- 2. Sync Sub-Events ---
    const { data: existingSubEvents } = await supabase.from('event_sub_events').select('id').eq('event_id', id);
    const existingIds = existingSubEvents?.map(i => i.id) || [];
    const newIds = subEvents.map(i => i.id).filter(Boolean);
    const toDelete = existingIds.filter(iId => !newIds.includes(iId as number));
    
    if (toDelete.length > 0) {
        const { error } = await supabase.from('event_sub_events').delete().in('id', toDelete);
        if (error) { return { error: `Failed to delete old sub-events: ${error.message}` }; }
    }
    if(subEvents.length > 0) {
        const mainEventDateString = eventUpdateData.start_time ? new Date(eventUpdateData.start_time).toISOString().split('T')[0] : null;
        const createTimestamp = (timeStr: string | null | undefined) => !timeStr || !mainEventDateString ? null : new Date(`${mainEventDateString}T${timeStr}:00.000Z`).toISOString();
        
        const toUpsert = subEvents.map(item => {
            const record: any = { ...item, event_id: id };
            record.start_time = createTimestamp(item.start_time);
            record.end_time = createTimestamp(item.end_time);
            if (!record.id) delete record.id;
            return record;
        });

      const { error } = await supabase.from('event_sub_events').upsert(toUpsert);
      if (error) { return { error: `Failed to save sub-events: ${error.message}` }; }
    }

    // --- 3. Sync Gallery ---
    const { data: existingGallery } = await supabase.from('event_gallery_images').select('id').eq('event_id', id);
    const existingGalleryIds = existingGallery?.map(g => g.id) || [];
    const newGalleryIds = gallery.map(g => g.id).filter(Boolean);
    const galleryToDelete = existingGalleryIds.filter(gId => !newGalleryIds.includes(gId as number));
    
    if(galleryToDelete.length > 0) {
        const { error } = await supabase.from('event_gallery_images').delete().in('id', galleryToDelete);
        if (error) { return { error: `Failed to delete old gallery images: ${error.message}` }; }
    }
    if(gallery.length > 0) {
      const toUpsert = gallery.map(item => {
        const record: any = { image_url: item.image_url, event_id: id };
        if (item.id) record.id = item.id;
        else delete record.id;
        return record;
      });
      const { error } = await supabase.from('event_gallery_images').upsert(toUpsert);
      if (error) { return { error: `Failed to save gallery: ${error.message}` }; }
    }
    
    // --- 4. Sync What To Bring ---
    const { data: existingBringItems } = await supabase.from('event_what_to_bring').select('id').eq('event_id', id);
    const existingBringIds = existingBringItems?.map(b => b.id) || [];
    const newBringIds = whatToBring.map(b => b.id).filter(Boolean);
    const bringToDelete = existingBringIds.filter(bId => !newBringIds.includes(bId as number));

    if(bringToDelete.length > 0) {
        const { error } = await supabase.from('event_what_to_bring').delete().in('id', bringToDelete);
        if (error) { return { error: `Failed to delete old "what to bring" items: ${error.message}` }; }
    }
    if(whatToBring.length > 0) {
      const toUpsert = whatToBring.map(item => {
        const record: any = { item: item.item, event_id: id };
        if (item.id) record.id = item.id;
        else delete record.id;
        return record;
      });
      const { error } = await supabase.from('event_what_to_bring').upsert(toUpsert);
      if (error) { return { error: `Failed to save "what to bring" list: ${error.message}` }; }
    }

  } catch (e: any) {
    console.error('Server action error in updateEvent:', e);
    return { error: `An unexpected error occurred: ${e.message}` };
  }

  revalidatePath('/dashboard/events');
  revalidatePath(`/dashboard/events/${id}`);
  return { success: true };
}
