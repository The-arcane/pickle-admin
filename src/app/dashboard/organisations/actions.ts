
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
    return { success: true, message: "Living Space details updated." };
}


export async function addBuilding(formData: FormData) {
    const supabase = await createServer();
    const organisation_id = formData.get('organisation_id');
    const name = formData.get('building_name');

    if (!organisation_id || !name) {
        return { error: 'Missing data for creating a building.' };
    }

    const { error } = await supabase
        .from('buildings')
        .insert({ organisation_id: Number(organisation_id), name: name as string });
    
    if (error) {
        if(error.code === '23505') return { error: 'A building with this name already exists.' };
        return { error: `Failed to add building: ${error.message}` };
    }
    revalidatePath('/dashboard/organisations');
    return { success: true, message: "Building added." };
}

export async function addBuildingNumber(formData: FormData) {
    const supabase = await createServer();
    const building_id = formData.get('building_id');
    const number = formData.get('building_wing_number');

    if (!building_id || !number) {
        return { error: 'Missing data for creating a wing/block.' };
    }

    const { error } = await supabase
        .from('building_numbers')
        .insert({ building_id: Number(building_id), number: number as string });

    if (error) {
        if(error.code === '23505') return { error: 'A wing/block with this number already exists in this building.' };
        return { error: `Failed to add wing/block: ${error.message}` };
    }
    revalidatePath('/dashboard/organisations');
    return { success: true, message: "Wing/Block added." };
}


export async function addFlat(formData: FormData) {
    const supabase = await createServer();
    const building_number_id = formData.get('building_number_id');
    const flat_number = formData.get('flat_number');

    if (!building_number_id || !flat_number) {
        return { error: 'Missing data for creating a flat.' };
    }

    const { error } = await supabase
        .from('flats')
        .insert({ building_number_id: Number(building_number_id), flat_number: (flat_number as string).toUpperCase().replace(/\s+/g, '') });

    if (error) {
        if(error.code === '23505') return { error: 'A flat with this number already exists in this wing/block.' };
        return { error: `Failed to add flat: ${error.message}` };
    }
    revalidatePath(`/dashboard/organisations/flats/${building_number_id}`);
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

export async function deleteBuildingNumber(formData: FormData) {
    const supabase = await createServer();
    const id = formData.get('id');
    if (!id) return { error: 'Building Number ID is missing.' };

    const { error } = await supabase.from('building_numbers').delete().eq('id', id);
    if (error) return { error: `Failed to delete wing/block: ${error.message}` };
    
    revalidatePath('/dashboard/organisations');
    return { success: true, message: 'Wing/Block deleted.' };
}

export async function deleteFlat(formData: FormData) {
    const supabase = await createServer();
    const id = formData.get('id');
    const building_number_id = formData.get('building_number_id');
    if (!id) return { error: 'Flat ID is missing.' };

    const { error } = await supabase.from('flats').delete().eq('id', id);
    if (error) return { error: `Failed to delete flat: ${error.message}` };
    
    revalidatePath(`/dashboard/organisations/flats/${building_number_id}`);
    return { success: true, message: 'Flat deleted.' };
}
