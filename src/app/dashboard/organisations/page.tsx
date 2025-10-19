
import { createServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { OrganisationClientPage } from './client';

export const dynamic = 'force-dynamic';

export default async function OrganisationPage() {
    const supabase = await createServer();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return redirect('/login');
    }

    const { data: userRecord } = await supabase
        .from('user')
        .select('id')
        .eq('user_uuid', user.id)
        .single();
    
    if (!userRecord) {
        return redirect('/login');
    }

    const { data: orgLink } = await supabase
        .from('user_organisations')
        .select('organisation_id')
        .eq('user_id', userRecord.id)
        .maybeSingle();

    if (!orgLink?.organisation_id) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <p className="text-muted-foreground">You are not associated with a Living Space.</p>
            </div>
        );
    }
    
    const { data: org, error } = await supabase
        .from('organisations')
        .select('*')
        .eq('id', orgLink.organisation_id)
        .single();

    if (error || !org) {
        return <p>Could not load Living Space details.</p>
    }

    // Fetch buildings and their flats in two steps for robustness
    const { data: buildingsData, error: buildingsError } = await supabase
        .from('buildings')
        .select('id, building_number')
        .eq('organisation_id', org.id)
        .order('building_number', { ascending: true });

    if(buildingsError) {
        console.error("Error fetching buildings:", buildingsError);
    }
    
    const buildings = buildingsData || [];
    let processedBuildings = [];

    if (buildings.length > 0) {
        const buildingIds = buildings.map(b => b.id);
        const { data: flatsData, error: flatsError } = await supabase
            .from('flats')
            .select('id, flat_number, building_id')
            .in('building_id', buildingIds)
            .order('flat_number', {ascending: true});

        if (flatsError) {
            console.error("Error fetching flats:", flatsError);
        }

        // Manually join flats to their buildings
        processedBuildings = buildings.map(building => ({
            ...building,
            flats: flatsData?.filter(flat => flat.building_id === building.id) || []
        }));
    } else {
        processedBuildings = [];
    }


    return (
      <OrganisationClientPage 
        organisation={org} 
        initialBuildings={processedBuildings} 
      />
    );
}
