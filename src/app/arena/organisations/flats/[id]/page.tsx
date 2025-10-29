
import { createServer } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { FlatsClientPage } from './client';

export const dynamic = 'force-dynamic';

export default async function FlatsPage({ params }: { params: { id: string } }) {
    const supabase = await createServer();
    const buildingNumberId = Number(params.id);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return redirect('/login?type=arena');
    }

    const { data: userRecord } = await supabase
        .from('user')
        .select('id')
        .eq('user_uuid', user.id)
        .single();
    
    if (!userRecord) {
        return redirect('/login?type=arena');
    }

    const { data: orgLink } = await supabase
        .from('user_organisations')
        .select('organisation_id')
        .eq('user_id', userRecord.id)
        .maybeSingle();

    if (!orgLink?.organisation_id) {
        notFound();
    }
    
    const { data: flats, error: flatsError } = await supabase
        .from('flats')
        .select('id, flat_number')
        .eq('building_number_id', buildingNumberId)
        .order('flat_number', { ascending: true });

    if (flatsError) console.error("Error fetching flats:", flatsError);

    // Fetch Building and Wing/Block info for the breadcrumb/title
    const { data: buildingNumberInfo, error: buildingInfoError } = await supabase
        .from('building_numbers')
        .select('number, building:buildings!inner(name, organisation_id)')
        .eq('id', buildingNumberId)
        .eq('buildings.organisation_id', orgLink.organisation_id)
        .single();
    
    if (buildingInfoError || !buildingNumberInfo) {
        notFound();
    }
    
    const buildingInfo = {
        buildingName: buildingNumberInfo.building.name,
        wingNumber: buildingNumberInfo.number,
    }

    return (
        <FlatsClientPage 
            buildingNumberId={buildingNumberId}
            initialFlats={flats || []}
            buildingInfo={buildingInfo}
        />
    );
}

