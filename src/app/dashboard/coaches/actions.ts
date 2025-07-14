
'use server';

import { createServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { CoachPricing, CoachSport } from './[id]/types';

// Helper to upload profile image
async function handleImageUpload(supabase: any, file: File | null, coachUserId: string): Promise<string | null> {
    if (!file || file.size === 0) {
        return null;
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `profile-${Date.now()}.${fileExt}`;
    // Store images in a public folder, organized by user ID
    const filePath = `public/coaches/${coachUserId}/${fileName}`;
    
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
    
    return publicUrlData.publicUrl;
}

function getCoachDataFromFormData(formData: FormData) {
     return {
        user_id: Number(formData.get('user_id')),
        organisation_id: Number(formData.get('organisation_id')),
        bio: formData.get('bio') as string,
        is_independent: formData.get('is_independent') === 'on',
    };
}

export async function addCoach(formData: FormData) {
    const supabase = await createServer();

    try {
        const coachData = getCoachDataFromFormData(formData);
        if (!coachData.user_id || !coachData.organisation_id) {
            return { error: 'User and Organization are required.' };
        }

        const profileImageFile = formData.get('profile_image_file') as File | null;
        let profileImageUrl: string | null = null;
        
        if (profileImageFile) {
            profileImageUrl = await handleImageUpload(supabase, profileImageFile, coachData.user_id.toString());
        }
        
        // 1. Insert coach record
        const { data: newCoach, error: coachError } = await supabase
            .from('coaches')
            .insert({ ...coachData, profile_image: profileImageUrl })
            .select()
            .single();
            
        if (coachError) {
            console.error('Error creating coach:', coachError);
            if (coachError.code === '23505') return { error: 'This user is already registered as a coach.' };
            return { error: `Failed to create coach profile: ${coachError.message}` };
        }
        const coachId = newCoach.id;

        // 2. Handle sports and pricing
        const sports = JSON.parse(formData.get('sports') as string) as Partial<CoachSport>[];
        const pricing = JSON.parse(formData.get('pricing') as string) as Partial<CoachPricing>[];
        
        if (sports.length > 0) {
            const sportsToInsert = sports.map(s => ({ coach_id: coachId, sport_id: s.sport_id }));
            const { error } = await supabase.from('coach_sports').insert(sportsToInsert);
            if (error) return { error: `Failed to link sports: ${error.message}` };
        }
        
        if (pricing.length > 0) {
            const pricingToInsert = pricing.map(p => ({ ...p, coach_id: coachId }));
            const { error } = await supabase.from('coach_pricing').insert(pricingToInsert);
            if (error) return { error: `Failed to save pricing: ${error.message}` };
        }

    } catch (e: any) {
        return { error: `An unexpected error occurred: ${e.message}` };
    }

    revalidatePath('/dashboard/coaches');
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

        if (profileImageFile) {
            const profileImageUrl = await handleImageUpload(supabase, profileImageFile, coachData.user_id.toString());
            if (profileImageUrl) updatePayload.profile_image = profileImageUrl;
        }

        // 1. Update coach record
        const { error: coachError } = await supabase
            .from('coaches')
            .update(updatePayload)
            .eq('id', id);
        
        if (coachError) return { error: `Failed to update coach: ${coachError.message}` };

        // 2. Sync sports
        const sports = JSON.parse(formData.get('sports') as string) as Partial<CoachSport>[];
        // Delete all existing sports for simplicity, then re-add
        await supabase.from('coach_sports').delete().eq('coach_id', id);
        if (sports.length > 0) {
            const sportsToInsert = sports.map(s => ({ coach_id: id, sport_id: s.sport_id }));
            const { error } = await supabase.from('coach_sports').insert(sportsToInsert);
            if (error) return { error: `Failed to update sports: ${error.message}` };
        }

        // 3. Sync pricing
        const pricing = JSON.parse(formData.get('pricing') as string) as Partial<CoachPricing>[];
        await supabase.from('coach_pricing').delete().eq('coach_id', id);
        if (pricing.length > 0) {
            const pricingToInsert = pricing.map(p => ({ ...p, coach_id: id }));
            const { error } = await supabase.from('coach_pricing').insert(pricingToInsert);
            if (error) return { error: `Failed to update pricing: ${error.message}` };
        }
        
    } catch (e: any) {
        return { error: `An unexpected error occurred: ${e.message}` };
    }

    revalidatePath('/dashboard/coaches');
    revalidatePath(`/dashboard/coaches/${id}`);
    return { success: true };
}
