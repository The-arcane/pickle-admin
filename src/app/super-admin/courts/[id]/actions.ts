

'use server';

import { createServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { CourtRule, CourtContact, AvailabilityBlock, RecurringUnavailability } from './types';

const MAX_FILE_SIZE_MB = 2;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// Helper to upload a file to Supabase Storage
async function handleImageUpload(supabase: any, file: File | null, courtId: string, imageType: 'main' | 'cover'): Promise<string | null> {
    if (!file || file.size === 0) {
        return null;
    }
    
    if (file.size > MAX_FILE_SIZE_BYTES) {
        throw new Error(`File size for ${imageType} image cannot exceed ${MAX_FILE_SIZE_MB}MB.`);
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${imageType}-${Date.now()}.${fileExt}`;
    // Store images in a public folder, organized by court ID
    const filePath = `public/${courtId}/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
        .from('court-images')
        .upload(filePath, file);

    if (uploadError) {
        console.error(`Error uploading ${imageType} image:`, uploadError);
        throw new Error(`Upload failed for ${file.name}: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabase.storage
        .from('court-images')
        .getPublicUrl(filePath);
    
    return publicUrlData.publicUrl;
}


// Extracts court data (excluding images) from FormData
function getCourtFields(formData: FormData) {
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
        feature: formData.get('feature') as string,
        badge_type: formData.get('badge_type') as string,
        c_start_time: formData.get('c_start_time') || null,
        c_end_time: formData.get('c_end_time') || null,
    };
}


export async function addCourt(formData: FormData) {
  const supabase = await createServer();
  
  try {
    const courtFields = getCourtFields(formData);

    if (!courtFields.name || !courtFields.organisation_id || !courtFields.sport_id) {
      return { error: 'Court Name, Venue, and Sport Type are required.' };
    }
    if (courtFields.lat === null || courtFields.lng === null || isNaN(courtFields.lat) || isNaN(courtFields.lng)) {
      return { error: 'Valid Latitude and Longitude are required.' };
    }
    
    // --- 1. Insert the main court record (without images first) ---
    const isPublic = formData.get('is_public') === 'true';
    const { data: newCourt, error: courtError } = await supabase
      .from('courts')
      .insert({...courtFields, is_public: isPublic})
      .select()
      .single();

    if (courtError || !newCourt) {
      console.error('Error adding court:', courtError);
      return { error: `Failed to add court. ${courtError?.message}` };
    }
    
    const courtId = newCourt.id.toString();
    const courtUpdateData: { image?: string; cover_image?: string } = {};

    // --- 2. Upload images and prepare update payload ---
    const mainImageFile = formData.get('main_image_file') as File | null;
    const coverImageFile = formData.get('cover_image_file') as File | null;
    
    const mainImageUrl = await handleImageUpload(supabase, mainImageFile, courtId, 'main');
    if (mainImageUrl) courtUpdateData.image = mainImageUrl;
    
    const coverImageUrl = await handleImageUpload(supabase, coverImageFile, courtId, 'cover');
    if (coverImageUrl) courtUpdateData.cover_image = coverImageUrl;

    // --- 3. Update court with image URLs if they were uploaded ---
    if (Object.keys(courtUpdateData).length > 0) {
        const { error: imageUpdateError } = await supabase
            .from('courts')
            .update(courtUpdateData)
            .eq('id', courtId);
        if (imageUpdateError) {
            console.error('Error updating court with images:', imageUpdateError);
            // Decide if we should return error or just log it
            return { error: `Court added, but failed to save images: ${imageUpdateError.message}` };
        }
    }

    // --- 4. Handle related tables ---
    const rules = JSON.parse(formData.get('rules') as string) as Partial<CourtRule>[];
    const contact = JSON.parse(formData.get('contact') as string) as Partial<CourtContact>;
    const availability = JSON.parse(formData.get('availability') as string) as Partial<AvailabilityBlock>[];
    const unavailability = JSON.parse(formData.get('unavailability') as string) as Partial<RecurringUnavailability>[];

    if (rules.length > 0) {
      const rulesToInsert = rules.filter(r => r.rule && r.rule.trim() !== '').map(r => ({ rule: r.rule, court_id: courtId }));
      if (rulesToInsert.length > 0) {
        const { error } = await supabase.from('court_rules').insert(rulesToInsert);
        if(error) { console.error('Error adding rules:', error); return { error: `Failed to save rules: ${error.message}` }; }
      }
    }
    if (contact.phone || contact.email) {
      const { error } = await supabase.from('court_contacts').insert({ ...contact, court_id: courtId });
      if(error) { console.error('Error adding contact:', error); return { error: `Failed to save contact info: ${error.message}` };}
    }
    
    const validAvailability = availability.filter(a => a.date);
    if (validAvailability.length > 0) {
      const availabilityToInsert = validAvailability.map(a => ({ ...a, court_id: courtId }));
      const { error } = await supabase.from('availability_blocks').insert(availabilityToInsert);
      if(error) { console.error('Error adding availability:', error); return { error: `Failed to save availability: ${error.message}` };}
    }
    
    const validUnavailability = unavailability.filter(u => u.day_of_week !== undefined && u.start_time && u.end_time);
    if (validUnavailability.length > 0) {
      const unavailabilityToInsert = validUnavailability.map(u => ({ ...u, court_id: courtId }));
      const { error } = await supabase.from('recurring_unavailability').insert(unavailabilityToInsert);
      if(error) { console.error('Error adding unavailability:', error); return { error: `Failed to save recurring unavailability: ${error.message}` };}
    }

  } catch (e: any) {
    console.error('Server action error in addCourt:', e);
    return { error: `An unexpected error occurred: ${e.message}` };
  }

  revalidatePath('/super-admin/courts');
  revalidatePath('/dashboard/courts');
  return { success: true };
}

export async function updateCourt(formData: FormData) {
  const supabase = await createServer();
  const id = formData.get('id') as string;

  try {
    if (!id) return { error: 'Court ID is missing.' };
    
    const courtFields = getCourtFields(formData);

    if (!courtFields.name || !courtFields.organisation_id || !courtFields.sport_id) {
      return { error: 'Court Name, Venue, and Sport Type are required.' };
    }
    
    const isPublic = formData.get('is_public') === 'true';
    const courtUpdateData: any = { ...courtFields, is_public: isPublic };
    
    // --- Handle Image Uploads ---
    const mainImageFile = formData.get('main_image_file') as File | null;
    const coverImageFile = formData.get('cover_image_file') as File | null;
    
    const mainImageUrl = await handleImageUpload(supabase, mainImageFile, id, 'main');
    if (mainImageUrl) courtUpdateData.image = mainImageUrl;
    
    const coverImageUrl = await handleImageUpload(supabase, coverImageFile, id, 'cover');
    if (coverImageUrl) courtUpdateData.cover_image = coverImageUrl;

    // --- 1. Update main court table ---
    const { data, error: courtError } = await supabase.from('courts').update(courtUpdateData).eq('id', id).select().single();
    if (courtError) { console.error('Error updating court:', courtError); return { error: `Failed to update court. ${courtError.message}` };}
    if (!data) { return { error: 'Failed to update court. No data was returned after update.' }; }
    
    // --- 2. Sync Existing Rules (Delete removed, then upsert all) ---
    const rules = JSON.parse(formData.get('rules') as string) as Partial<CourtRule>[];
    const { data: existingRules } = await supabase.from('court_rules').select('id').eq('court_id', id);
    if (!existingRules) { return { error: "Could not fetch existing court rules." }; }
    const existingRuleIds = existingRules.map(r => r.id);
    const newRuleIds = rules.map(r => r.id).filter(Boolean);
    const rulesToDelete = existingRuleIds.filter(ruleId => !newRuleIds.includes(ruleId as number));
    
    if (rulesToDelete.length > 0) {
        const { error } = await supabase.from('court_rules').delete().in('id', rulesToDelete);
        if (error) { console.error('Error deleting rules:', error); return { error: `Failed to delete old rules: ${error.message}` }; }
    }
    const rulesToUpsert = rules.filter(r => r.rule && r.rule.trim() !== '').map(r => {
        const record: any = { rule: r.rule, court_id: id };
        if (r.id) record.id = r.id;
        return record;
    });
    if(rulesToUpsert.length > 0) {
      const { error } = await supabase.from('court_rules').upsert(rulesToUpsert);
      if (error) { console.error('Error upserting rules:', error); return { error: `Failed to save rules: ${error.message}` }; }
    }
    
    // --- 3. Sync Contact ---
    const contact = JSON.parse(formData.get('contact') as string) as Partial<CourtContact>;
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

    // --- 4. Sync Availability Blocks ---
    const availability = JSON.parse(formData.get('availability') as string) as Partial<AvailabilityBlock>[];
    const { data: existingAvailability } = await supabase.from('availability_blocks').select('id').eq('court_id', id);
    if (!existingAvailability) { return { error: "Could not fetch existing availability." }; }
    const existingAvailabilityIds = existingAvailability.map(a => a.id);
    const newAvailabilityIds = availability.map(a => a.id).filter(Boolean);
    const availabilityToDelete = existingAvailabilityIds.filter(aId => !newAvailabilityIds.includes(aId as number));

    if (availabilityToDelete.length > 0) {
        const { error } = await supabase.from('availability_blocks').delete().in('id', availabilityToDelete);
        if (error) { console.error('Error deleting availability:', error); return { error: `Failed to delete old availability blocks: ${error.message}` }; }
    }
    const availabilityToUpsert = availability.filter(a => a.date).map(a => {
        const record: any = { court_id: id, date: a.date, start_time: a.start_time, end_time: a.end_time, reason: a.reason };
        if (a.id) record.id = a.id;
        return record;
      });
    if(availabilityToUpsert.length > 0) {
      const { error } = await supabase.from('availability_blocks').upsert(availabilityToUpsert);
      if (error) { console.error('Error upserting availability:', error); return { error: `Failed to save availability: ${error.message}` }; }
    }
    
    // --- 5. Sync Recurring Unavailability ---
    const unavailability = JSON.parse(formData.get('unavailability') as string) as Partial<RecurringUnavailability>[];
    const { data: existingUnavailability } = await supabase.from('recurring_unavailability').select('id').eq('court_id', id);
    if (!existingUnavailability) { return { error: "Could not fetch existing recurring unavailability." }; }
    const existingUnavailabilityIds = existingUnavailability.map(u => u.id);
    const newUnavailabilityIds = unavailability.map(u => u.id).filter(Boolean);
    const unavailabilityToDelete = existingUnavailabilityIds.filter(uId => !newUnavailabilityIds.includes(uId as number));
    
    if(unavailabilityToDelete.length > 0) {
        const { error } = await supabase.from('recurring_unavailability').delete().in('id', unavailabilityToDelete);
        if (error) { console.error('Error deleting recurring unavailability:', error); return { error: `Failed to delete old recurring unavailability: ${error.message}` }; }
    }
    const unavailabilityToUpsert = unavailability.filter(u => u.day_of_week !== undefined && u.start_time && u.end_time).map(u => {
        const record: any = { court_id: id, day_of_week: u.day_of_week, start_time: u.start_time, end_time: u.end_time, reason: u.reason, active: u.active ?? true };
        if (u.id) record.id = u.id;
        return record;
      });
    if(unavailabilityToUpsert.length > 0) {
      const { error } = await supabase.from('recurring_unavailability').upsert(unavailabilityToUpsert);
      if (error) { console.error('Error upserting recurring unavailability:', error); return { error: `Failed to save recurring unavailability: ${error.message}` }; }
    }


  } catch (e: any) {
    console.error('Server action error in updateCourt:', e);
    return { error: `An unexpected error occurred: ${e.message}` };
  }

  revalidatePath('/super-admin/courts');
  revalidatePath('/dashboard/courts');
  revalidatePath(`/super-admin/courts/${id}`);
  revalidatePath(`/dashboard/courts/${id}`);
  return { success: true };
}


// --- Gallery Actions ---

async function handleGalleryImageUpload(supabase: any, file: File, courtId: string): Promise<string | null> {
    if (!file || file.size === 0) {
        return null;
    }

     if (file.size > MAX_FILE_SIZE_BYTES) {
        throw new Error(`File size cannot exceed ${MAX_FILE_SIZE_MB}MB.`);
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `gallery-${Date.now()}.${fileExt}`;
    // Store images in a public folder, organized by court ID in a gallery subfolder
    const filePath = `public/${courtId}/gallery/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
        .from('court-images') // Use courts bucket for gallery
        .upload(filePath, file);

    if (uploadError) {
        console.error(`Error uploading gallery image:`, uploadError);
        throw new Error(`Upload failed for ${file.name}: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabase.storage
        .from('court-images')
        .getPublicUrl(filePath);
    
    return publicUrlData.publicUrl;
}

export async function addCourtGalleryImages(formData: FormData) {
    const supabase = await createServer();
    const courtId = formData.get('court_id') as string;
    const images = formData.getAll('images') as File[];

    if (!courtId || images.length === 0) {
        return { error: 'Court ID and images are required.' };
    }

    try {
        const uploadPromises = images
            .filter(img => img.size > 0)
            .map(img => handleGalleryImageUpload(supabase, img, courtId));
        
        const imageUrls = await Promise.all(uploadPromises);

        const validUrls = imageUrls.filter((url): url is string => url !== null);
        
        if (validUrls.length > 0) {
            const recordsToInsert = validUrls.map(url => ({
                court_id: Number(courtId),
                image_url: url
            }));

            const { error: insertError } = await supabase.from('court_gallery').insert(recordsToInsert);
            if (insertError) {
                console.error("Error inserting gallery images to db:", insertError);
                return { error: `Images uploaded, but failed to save to gallery: ${insertError.message}`};
            }
        } else {
             return { error: 'No valid images were uploaded.' };
        }

    } catch (e: any) {
        return { error: e.message };
    }

    revalidatePath(`/super-admin/courts/${courtId}`);
    revalidatePath(`/dashboard/courts/${courtId}`);
    return { success: true };
}


export async function deleteCourtGalleryImage(formData: FormData) {
    const supabase = await createServer();
    const courtId = formData.get('court_id') as string;
    const imageId = formData.get('image_id') as string;
    const imageUrl = formData.get('image_url') as string;

    if (!imageId || !imageUrl || !courtId) {
        return { error: 'Missing required fields to delete image.' };
    }

    try {
        // 1. Delete from storage
        const url = new URL(imageUrl);
        const filePath = decodeURIComponent(url.pathname.split('/court-images/')[1]);
        
        const { error: storageError } = await supabase.storage.from('court-images').remove([filePath]);
        if (storageError) {
            console.error("Error deleting from storage:", storageError);
            // Non-fatal error, we can still proceed to delete from DB
        }

        // 2. Delete from database
        const { error: dbError } = await supabase.from('court_gallery').delete().eq('id', imageId);
        if (dbError) {
            console.error("Error deleting from db:", dbError);
            return { error: `Failed to remove image from gallery: ${dbError.message}`};
        }

    } catch (e: any) {
        return { error: e.message };
    }

    revalidatePath(`/super-admin/courts/${courtId}`);
    revalidatePath(`/dashboard/courts/${courtId}`);
    return { success: true };
}
