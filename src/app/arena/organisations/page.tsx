
import { createServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { OrganisationClientPage } from '@/app/livingspace/organisations/client';

export const dynamic = 'force-dynamic';

export default async function OrganisationPage() {
    const supabase = await createServer();
    
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
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <p className="text-muted-foreground">You are not associated with an Arena.</p>
            </div>
        );
    }
    
    const { data: org, error } = await supabase
        .from('organisations')
        .select('*')
        .eq('id', orgLink.organisation_id)
        .single();

    if (error || !org) {
        return <p>Could not load Arena details.</p>
    }

    // Fetch buildings and their nested data
    const { data: buildings, error: buildingsError } = await supabase
        .from('buildings')
        .select(`
            id,
            name,
            building_numbers (
                id,
                number,
                flats (
                    id,
                    flat_number
                )
            )
        `)
        .eq('organisation_id', org.id)
        .order('name', { ascending: true });
    
    if (buildingsError) {
        console.error("Error fetching buildings:", buildingsError);
    }

    return (
      <OrganisationClientPage 
        organisation={org} 
        initialBuildings={buildings || []} 
        orgTypeName="Sports Venue"
        orgTypePluralName="Sports Venues"
      />
    );
}
