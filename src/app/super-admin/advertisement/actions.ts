'use server';

import { createServiceRoleServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

const MAX_FILE_SIZE_MB = 2;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const BUCKET_NAME = 'advertisements';

async function handleImageUpload(supabase: any, file: File | null, orgId: string, adName: string): Promise<string | null> {
    if (!file || file.size === 0) return null;
    
    if (file.size > MAX_FILE_SIZE_BYTES) {
        throw new Error(`File size cannot exceed ${MAX_FILE_SIZE_MB}MB.`);
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${adName.replace(/\s+/g, '-')}-${Date.now()}.${fileExt}`;
    const filePath = `public/${orgId}/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file);

    if (uploadError) {
        console.error(`Error uploading ad image:`, uploadError);
        throw new Error(`Upload failed for ${file.name}: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);
    
    return publicUrlData.publicUrl;
}

export async function saveAdvertisement(formData: FormData) {
    const supabase = createServiceRoleServer();
    
    const id = formData.get('id') as string | null;
    const name = formData.get('name') as string;
    const orgId = formData.get('organisation_id') as string;

    if (!name || !orgId) {
        return { error: 'Advertisement name and organization are required.' };
    }

    try {
        const payload: any = {
            name,
            organisation_id: Number(orgId),
            placement_id: Number(formData.get('placement_id')),
            type_id: Number(formData.get('type_id')),
            status_id: Number(formData.get('status_id')),
            target_audience_id: Number(formData.get('target_audience_id')) || null,
            link_url: formData.get('link_url') as string,
            is_global: formData.get('is_global') === 'on',
            start_date: formData.get('start_date') || null,
            end_date: formData.get('end_date') || null,
        };

        const imageFile = formData.get('image_file') as File | null;
        if (imageFile && imageFile.size > 0) {
            const imageUrl = await handleImageUpload(supabase, imageFile, orgId, name);
            if(imageUrl) payload.image_url = imageUrl;
        }

        if (id) {
            // Update
            const { error } = await supabase.from('advertisements').update(payload).eq('id', id);
            if (error) throw error;
        } else {
            // Insert
            if (!payload.image_url) {
                return { error: 'An image is required when creating a new advertisement.'};
            }
            const { error } = await supabase.from('advertisements').insert(payload);
            if (error) throw error;
        }

    } catch (e: any) {
        console.error('Error saving advertisement:', e);
        return { error: `Database error: ${e.message}` };
    }

    revalidatePath('/super-admin/advertisement/web');
    revalidatePath('/super-admin/advertisement/mobile');
    return { success: true, message: `Advertisement '${name}' saved successfully.` };
}


export async function deleteAdvertisement(formData: FormData) {
    const supabase = createServiceRoleServer();
    const id = formData.get('id') as string;
    
    if (!id) {
        return { error: 'Advertisement ID is missing.' };
    }

    // TODO: Also delete image from storage
    const { error } = await supabase.from('advertisements').delete().eq('id', id);

    if (error) {
        return { error: `Failed to delete advertisement: ${error.message}` };
    }

    revalidatePath('/super-admin/advertisement/web');
    revalidatePath('/super-admin/advertisement/mobile');
    return { success: true, message: 'Advertisement deleted.' };
}

export async function toggleAdStatus(id: number, currentStatusId: number) {
    const supabase = createServiceRoleServer();

    // Assuming 1 = Active, 2 = Offline
    const newStatusId = currentStatusId === 1 ? 2 : 1;

    const { error } = await supabase
        .from('advertisements')
        .update({ status_id: newStatusId })
        .eq('id', id);
    
    if (error) {
        return { error: `Failed to update status: ${error.message}` };
    }

    revalidatePath('/super-admin/advertisement/web');
    revalidatePath('/super-admin/advertisement/mobile');
    return { success: true, message: 'Ad status updated.' };
}
