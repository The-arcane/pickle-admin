

'use server';

import { createServer, createServiceRoleServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { CoachPricing, CoachSport } from './[id]/types';

const MAX_FILE_SIZE_MB = 2;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// Helper to upload profile image
async function handleImageUpload(supabase: any, file: File | null, coachUserId: string): Promise<string | null> {
    if (!file || file.size === 0) {
        console.log("No image file provided for upload.");
        return null;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
        console.error(`File size ${file.size} exceeds limit of ${MAX_FILE_SIZE_BYTES} bytes.`);
        throw new Error(`File size cannot exceed ${MAX_FILE_SIZE_MB}MB.`);
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `profile-${Date.now()}.${fileExt}`;
    const filePath = `public/coaches/${coachUserId}/${fileName}`;
    
    console.log(`Uploading coach profile image to: ${filePath}`);
    const { error: uploadError } = await supabase.storage
        .from('coach-profiles')
        .upload(filePath, file);

    if (uploadError) {
        console.error('Error uploading coach image:', uploadError);
        throw new Error(`Upload failed for ${file.name}: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabase.storage
        .from('coach-profiles')
        .getPublicUrl(filePath);
    
    console.log(`Successfully uploaded image. Public URL: ${publicUrlData.publicUrl}`);
    return publicUrlData.publicUrl;
}

function getCoachDataFromFormData(formData: FormData) {
     return {
        user_id: Number(formData.get('user_id')),
        organisation_id: Number(formData.get('organisation_id')),
        bio: formData.get('bio') as string,
        is_independent: formData.get('is_independent') === 'true',
    };
}

export async function addCoach(formData: FormData) {
    console.log("Starting addCoach server action...");
    const supabaseAdmin = await createServiceRoleServer();

    try {
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const organisation_id = Number(formData.get('organisation_id'));
        const bio = formData.get('bio') as string;
        const is_independent = formData.get('is_independent') === 'true';

        if (!name || !email || !password || !organisation_id) {
            console.error("Validation failed: Missing required fields.");
            return { error: 'Name, email, password and organization are required.' };
        }

        console.log(`1. Creating user in Supabase Auth for email: ${email}`);
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            user_metadata: { name },
            email_confirm: true, // Auto-confirm the email
        });

        if (authError || !authUser.user) {
            console.error("Error creating coach auth user:", authError);
            return { error: `Failed to create user: ${authError?.message || 'Could not create user account.'}` };
        }
        const newUserUuid = authUser.user.id;
        console.log(`Successfully created auth user with UUID: ${newUserUuid}`);
        
        console.log(`2. Updating public.user record for UUID ${newUserUuid}`);
        const { data: newUserProfile, error: profileError } = await supabaseAdmin
            .from('user')
            .update({
                user_type: 5, // 5 for Coach
                organisation_id: organisation_id,
                name: name
            })
            .eq('user_uuid', newUserUuid)
            .select('id')
            .single();
        
        if (profileError || !newUserProfile) {
            console.error('Error updating user profile for coach:', profileError);
            await supabaseAdmin.auth.admin.deleteUser(newUserUuid);
            return { error: `Failed to set user as coach: ${profileError?.message}` };
        }
        console.log(`Successfully updated user profile. User ID: ${newUserProfile.id}`);

        console.log(`3. Manually inserting new coach record for user ID: ${newUserProfile.id}`);
        const { data: newCoach, error: coachInsertError } = await supabaseAdmin
            .from('coaches')
            .insert({ user_id: newUserProfile.id, organisation_id: organisation_id })
            .select('id, user_id')
            .single();

        if (coachInsertError || !newCoach) {
             console.error('Could not insert coach record:', coachInsertError);
             // Cleanup auth user if coach record wasn't created.
             await supabaseAdmin.auth.admin.deleteUser(newUserUuid);
             return { error: `System error: Could not create coach profile: ${coachInsertError?.message}` };
        }
        console.log(`Successfully inserted new coach record with ID: ${newCoach.id}`);
        
        const coachId = newCoach.id;
        const coachUserId = newCoach.user_id.toString();

        const updatePayload: { bio: string, is_independent: boolean, profile_image?: string } = { bio, is_independent };

        console.log("4. Handling image upload...");
        const profileImageFile = formData.get('profile_image_file') as File | null;
        if (profileImageFile && profileImageFile.size > 0) {
            const profileImageUrl = await handleImageUpload(supabaseAdmin, profileImageFile, coachUserId);
            if(profileImageUrl) updatePayload.profile_image = profileImageUrl;
        }

        console.log("Updating coach details with payload:", updatePayload);
        const { error: coachUpdateError } = await supabaseAdmin
            .from('coaches')
            .update(updatePayload)
            .eq('id', coachId);
            
        if (coachUpdateError) {
            console.error('Error updating coach details:', coachUpdateError);
            // This is not a fatal error for the whole process, but we should let the user know.
        }

        console.log("5. Handling sports and pricing...");
        const sports = JSON.parse(formData.get('sports') as string) as Partial<CoachSport>[];
        const pricing = JSON.parse(formData.get('pricing') as string) as Partial<CoachPricing>[];
        
        if (sports.length > 0) {
            const sportsToInsert = sports.map(s => ({ coach_id: coachId, sport_id: s.sport_id }));
            console.log("Inserting sports:", sportsToInsert);
            const { error } = await supabaseAdmin.from('coach_sports').insert(sportsToInsert);
            if (error) { console.error("Error inserting sports:", error); return { error: `Failed to link sports: ${error.message}` }; }
        }
        
        if (pricing.length > 0) {
            const pricingToInsert = pricing.map(({ id, ...p }) => ({ ...p, coach_id: coachId, currency: 'INR' }));
            console.log("Inserting pricing:", pricingToInsert);
            const { error } = await supabaseAdmin.from('coach_pricing').insert(pricingToInsert);
            if (error) { console.error("Error inserting pricing:", error); return { error: `Failed to save pricing: ${error.message}` }; }
        }

    } catch (e: any) {
        console.error("An unexpected error occurred in addCoach:", e);
        return { error: `An unexpected error occurred: ${e.message}` };
    }

    console.log("Coach added successfully. Revalidating path...");
    revalidatePath('/livingspace/coaches');
    return { success: true };
}

export async function updateCoach(formData: FormData) {
    const supabase = await createServer();
    const id = Number(formData.get('id'));

    try {
        if (!id) return { error: 'Coach ID is missing.' };

        const coachData = getCoachDataFromFormData(formData);
        const profileImageFile = formData.get('profile_image_file') as File | null;
        const updatePayload: any = { ...coachData };

        if (profileImageFile && profileImageFile.size > 0) {
            const profileImageUrl = await handleImageUpload(supabase, profileImageFile, coachData.user_id.toString());
            if (profileImageUrl) updatePayload.profile_image = profileImageUrl;
        }

        console.log(`1. Updating coach record ID ${id} with payload:`, updatePayload);
        const { error: coachError } = await supabase
            .from('coaches')
            .update(updatePayload)
            .eq('id', id);
        
        if (coachError) { console.error("Error updating coach:", coachError); return { error: `Failed to update coach: ${coachError.message}` }; }

        console.log("2. Syncing sports...");
        const sports = JSON.parse(formData.get('sports') as string) as Partial<CoachSport>[];
        await supabase.from('coach_sports').delete().eq('coach_id', id);
        if (sports.length > 0) {
            const sportsToInsert = sports.map(s => ({ coach_id: id, sport_id: s.sport_id }));
            console.log("Inserting sports:", sportsToInsert);
            const { error } = await supabase.from('coach_sports').insert(sportsToInsert);
            if (error) { console.error("Error updating sports:", error); return { error: `Failed to update sports: ${error.message}` }; }
        }

        console.log("3. Syncing pricing...");
        const pricing = JSON.parse(formData.get('pricing') as string) as Partial<CoachPricing>[];
        await supabase.from('coach_pricing').delete().eq('coach_id', id);
        if (pricing.length > 0) {
            const pricingToInsert = pricing.map(({ id: pricingId, ...p }) => ({ ...p, coach_id: id, currency: 'INR' }));
            console.log("Inserting pricing:", pricingToInsert);
            const { error } = await supabase.from('coach_pricing').insert(pricingToInsert);
            if (error) { console.error("Error updating pricing:", error); return { error: `Failed to update pricing: ${error.message}` }; }
        }
        
    } catch (e: any) {
        console.error("An unexpected error occurred in updateCoach:", e);
        return { error: `An unexpected error occurred: ${e.message}` };
    }

    console.log("Coach updated successfully. Revalidating paths...");
    revalidatePath('/livingspace/coaches');
    revalidatePath(`/livingspace/coaches/${id}`);
    return { success: true };
}
