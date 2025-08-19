
'use server';

import { createServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

const MAX_FILE_SIZE_MB = 2;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const BUCKET_NAME = 'package_images';

async function handleImageUpload(supabase: any, file: File | null, orgId: number): Promise<string | null> {
    if (!file || file.size === 0) return null;

    if (file.size > MAX_FILE_SIZE_BYTES) {
        throw new Error(`File size cannot exceed ${MAX_FILE_SIZE_MB}MB.`);
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${orgId}/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file);

    if (uploadError) {
        console.error('Error uploading package image:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);
    
    return publicUrlData.publicUrl;
}

function getPackageDataFromFormData(formData: FormData) {
    const features = (formData.get('features') as string)
        .split(',')
        .map(f => f.trim())
        .filter(f => f);

    return {
        title: formData.get('title') as string,
        price_text: formData.get('price_text') as string | null,
        price_value: formData.get('price_value') ? Number(formData.get('price_value')) : null,
        description: formData.get('description') as string,
        features: features.length > 0 ? features : null,
        is_active: formData.get('is_active') === 'on',
    };
}

async function getOrgId(supabase: any): Promise<number | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: userProfile } = await supabase.from('user').select('id').eq('user_uuid', user.id).single();
    if (!userProfile) return null;

    const { data: orgLink } = await supabase.from('user_organisations').select('organisation_id').eq('user_id', userProfile.id).single();
    return orgLink?.organisation_id || null;
}

export async function addPackage(formData: FormData) {
    const supabase = await createServer();
    const organisation_id = await getOrgId(supabase);
    if (!organisation_id) {
        return { error: "Could not determine your organization." };
    }

    try {
        const packageData = getPackageDataFromFormData(formData);
        const imageFile = formData.get('image_file') as File | null;
        let imageUrl: string | null = null;
        if(imageFile) {
            imageUrl = await handleImageUpload(supabase, imageFile, organisation_id);
        }

        const payload = {
            ...packageData,
            organisation_id,
            image_url: imageUrl,
        };

        const { error } = await supabase.from('packages').insert(payload);
        if (error) {
            return { error: `Failed to create package: ${error.message}` };
        }
    } catch (e: any) {
        return { error: `An unexpected error occurred: ${e.message}` };
    }

    revalidatePath('/hospitality/packages');
    return { success: true };
}

export async function updatePackage(formData: FormData) {
    const supabase = await createServer();
    const id = Number(formData.get('id'));
     const organisation_id = await getOrgId(supabase);
    if (!organisation_id) {
        return { error: "Could not determine your organization." };
    }

    try {
        const packageData = getPackageDataFromFormData(formData);
        const imageFile = formData.get('image_file') as File | null;
        
        const payload: any = { ...packageData };
        
        if (imageFile && imageFile.size > 0) {
            payload.image_url = await handleImageUpload(supabase, imageFile, organisation_id);
        }
        
        const { error } = await supabase.from('packages').update(payload).eq('id', id);
        if (error) {
            return { error: `Failed to update package: ${error.message}` };
        }
    } catch (e: any) {
        return { error: `An unexpected error occurred: ${e.message}` };
    }

    revalidatePath('/hospitality/packages');
    return { success: true };
}

export async function deletePackage(formData: FormData) {
    const supabase = await createServer();
    const id = Number(formData.get('id'));

    const { error } = await supabase.from('packages').delete().eq('id', id);
    if(error) {
        return { error: `Failed to delete package: ${error.message}` };
    }

    revalidatePath('/hospitality/packages');
    return { success: true };
}
