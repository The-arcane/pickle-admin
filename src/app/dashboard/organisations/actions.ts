
'use server';

import { createServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateOrganization(formData: FormData) {
    const supabase = await createServer();
    const id = formData.get('id');
    const name = formData.get('name') as string;
    const address = formData.get('address') as string;
    const logo = formData.get('logo') as string;

    if (!id) {
        return { error: 'Living Space ID is missing.' };
    }

    const { error } = await supabase
        .from('organisations')
        .update({ name, address, logo })
        .eq('id', id);

    if (error) {
        console.error("Error updating organization:", error);
        return { error: `Failed to update Living Space: ${error.message}` };
    }

    revalidatePath('/dashboard/organisations');
    revalidatePath('/dashboard'); // To update the name in the layout
    return { success: true };
}


export async function addBuilding(formData: FormData) {
    const supabase = await createServer();
    const organisation_id = formData.get('organisation_id');
    const building_number = formData.get('building_number');

    if (!organisation_id || !building_number) {
        return { error: 'Missing data for creating a building.' };
    }

    const { error } = await supabase
        .from('buildings')
        .insert({ organisation_id: Number(organisation_id), building_number: building_number as string });
    
    if (error) {
        if(error.code === '23505') return { error: 'A building with this number already exists.' };
        return { error: `Failed to add building: ${error.message}` };
    }
    revalidatePath('/dashboard/organisations');
    return { success: true, message: "Building added." };
}

export async function addFlat(formData: FormData) {
    const supabase = await createServer();
    const building_id = formData.get('building_id');
    const flat_number = formData.get('flat_number');

    if (!building_id || !flat_number) {
        return { error: 'Missing data for creating a flat.' };
    }

    const { error } = await supabase
        .from('flats')
        .insert({ building_id: Number(building_id), flat_number: flat_number as string });

    if (error) {
        if(error.code === '23505') return { error: 'A flat with this number already exists in this building.' };
        return { error: `Failed to add flat: ${error.message}` };
    }
    revalidatePath('/dashboard/organisations');
    return { success: true, message: "Flat added." };
}

export async function deleteBuilding(formData: FormData) {
    const supabase = await createServer();
    const id = formData.get('id');
    if (!id) return { error: 'Building ID is missing.' };

    const { error } = await supabase.from('buildings').delete().eq('id', id);
    if (error) return { error: `Failed to delete building: ${error.message}` };
    
    revalidatePath('/dashboard/organisations');
    return { success: true, message: 'Building deleted.' };
}

export async function deleteFlat(formData: FormData) {
    const supabase = await createServer();
    const id = formData.get('id');
    if (!id) return { error: 'Flat ID is missing.' };

    const { error } = await supabase.from('flats').delete().eq('id', id);
    if (error) return { error: `Failed to delete flat: ${error.message}` };
    
    revalidatePath('/dashboard/organisations');
    return { success: true, message: 'Flat deleted.' };
}
