
import { createServer } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { FlatsClientPage } from './client';

export const dynamic = 'force-dynamic';

export default async function ManageFlatsPage({ params }: { params: { id: string } }) {
    const supabase = await createServer();
    const buildingNumberId = parseInt(params.id, 10);

    if (isNaN(buildingNumberId)) {
        notFound();
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return redirect('/login');
    }
    
    // Fetch building number details and parent building name
    const { data: buildingNumberData, error: buildingNumberError } = await supabase
        .from('building_numbers')
        .select(`
            number,
            building:buildings (
                name,
                organisation_id
            )
        `)
        .eq('id', buildingNumberId)
        .single();
        
    if (buildingNumberError || !buildingNumberData) {
        console.error("Error fetching building number details:", buildingNumberError);
        notFound();
    }
    
    // Fetch flats for the building number
    const { data: flats, error: flatsError } = await supabase
        .from('flats')
        .select('id, flat_number')
        .eq('building_number_id', buildingNumberId)
        .order('flat_number', { ascending: true });
        
    if (flatsError) {
        console.error("Error fetching flats:", flatsError);
        // We can still render the page with an empty list
    }
    
    const buildingInfo = {
        buildingName: buildingNumberData.building?.name ?? 'N/A',
        wingNumber: buildingNumberData.number ?? 'N/A'
    };

    return (
        <FlatsClientPage 
            buildingNumberId={buildingNumberId}
            initialFlats={flats || []}
            buildingInfo={buildingInfo}
        />
    );
}
