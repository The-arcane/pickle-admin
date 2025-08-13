
'use server';

import { createServiceRoleServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const MAX_FILE_SIZE_MB = 2;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const BUCKET_NAME = 'organisation-websites';

// Helper for a single image upload
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

// Action for saving only text content
export async function saveWebsiteTextDetails(formData: FormData) {
    const supabase = createServiceRoleServer();
    const orgId = Number(formData.get('org_id'));

    if (!orgId) return { error: 'Organization ID is missing.' };

    try {
        const payload = {
            org_id: orgId,
            About: formData.get('about') as string,
            Our_vision: formData.get('vision') as string,
            Our_mission: formData.get('mission') as string,
        };

        const { error } = await supabase.from('organisations_website').upsert(payload, { onConflict: 'org_id' });

        if (error) {
            console.error('Error saving website text details:', error);
            return { error: `Failed to save website details: ${error.message}` };
        }
    } catch (e: any) {
        return { error: `An unexpected error occurred: ${e.message}` };
    }

    revalidatePath(`/sales/organisations/${orgId}/website`);
    return { success: true, message: 'Content saved successfully.' };
}


// A generic action to handle a single image upload and update the DB
export async function saveWebsiteImage(formData: FormData) {
    const supabase = createServiceRoleServer();
    const orgId = Number(formData.get('org_id'));
    const imageType = formData.get('image_type') as 'logo' | 'bg_image' | 'vis_image' | 'mis_image';
    const imageFile = formData.get('image_file') as File | null;

    if (!orgId || !imageType || !imageFile) {
        return { error: 'Missing required data for image upload.' };
    }

    try {
        const imageUrl = await handleImageUpload(supabase, imageFile, orgId.toString(), imageType);
        
        if (imageUrl) {
            const { error } = await supabase
                .from('organisations_website')
                .upsert({ org_id: orgId, [imageType]: imageUrl }, { onConflict: 'org_id' });

            if (error) {
                 return { error: `Failed to save image URL to database: ${error.message}` };
            }
        } else {
            return { error: 'Image upload failed, URL not returned.' };
        }
    } catch(e: any) {
        return { error: e.message };
    }
    
    revalidatePath(`/sales/organisations/${orgId}/website`);
    return { success: true, message: `${imageType.replace('_', ' ')} updated successfully.` };
}
