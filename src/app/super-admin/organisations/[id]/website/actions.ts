
'use server';

import { createServiceRoleServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const MAX_FILE_SIZE_MB = 2;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const BUCKET_NAME = 'organisation-websites';

// Helper for image uploads
async function handleImageUpload(supabase: any, file: File | null, orgId: string, imageType: string): Promise<string | null> {
    if (!file || file.size === 0) return null;
    
    if (file.size > MAX_FILE_SIZE_BYTES) {
        throw new Error(`File size for ${imageType} image cannot exceed ${MAX_FILE_SIZE_MB}MB.`);
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${imageType}-${Date.now()}.${fileExt}`;
    const filePath = `public/${orgId}/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file);

    if (uploadError) {
        console.error(`Error uploading ${imageType} image:`, uploadError);
        throw new Error(`Upload failed for ${file.name}: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);
    
    return publicUrlData.publicUrl;
}

export async function saveWebsiteDetails(formData: FormData) {
    const supabase = createServiceRoleServer();

    const orgId = Number(formData.get('org_id'));
    const websiteId = formData.get('id') ? Number(formData.get('id')) : null;

    if (!orgId) {
        return { error: 'Organization ID is missing.' };
    }

    try {
        const payload: any = {
            org_id: orgId,
            About: formData.get('about') as string,
            Our_vision: formData.get('vision') as string,
            Our_mission: formData.get('mission') as string,
        };

        // Handle image uploads in parallel
        const logoFile = formData.get('logo_file') as File | null;
        const bgImageFile = formData.get('bg_image_file') as File | null;
        const visImageFile = formData.get('vis_image_file') as File | null;
        const misImageFile = formData.get('mis_image_file') as File | null;

        const [logoUrl, bgImageUrl, visImageUrl, misImageUrl] = await Promise.all([
            handleImageUpload(supabase, logoFile, orgId.toString(), 'logo'),
            handleImageUpload(supabase, bgImageFile, orgId.toString(), 'bg'),
            handleImageUpload(supabase, visImageFile, orgId.toString(), 'vision'),
            handleImageUpload(supabase, misImageFile, orgId.toString(), 'mission')
        ]);

        if (logoUrl) payload.logo = logoUrl;
        if (bgImageUrl) payload.bg_image = bgImageUrl;
        if (visImageUrl) payload.vis_image = visImageUrl;
        if (misImageUrl) payload.mis_image = misImageUrl;

        // Upsert the data
        const { error } = await supabase.from('organisations_website').upsert(
          websiteId ? { id: websiteId, ...payload } : payload,
          { onConflict: 'org_id' }
        );

        if (error) {
            console.error('Error saving website details:', error);
            return { error: `Failed to save website details: ${error.message}` };
        }

    } catch(e: any) {
        return { error: `An unexpected error occurred: ${e.message}` };
    }

    revalidatePath(`/super-admin/organisations/${orgId}/website`);
    redirect(`/super-admin/organisations/${orgId}/website`);
}
