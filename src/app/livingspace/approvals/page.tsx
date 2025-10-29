
import { createServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ApprovalsClientPage } from './client';

export const dynamic = 'force-dynamic';

export default async function ApprovalsPage() {
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
         return (
            <div className="flex flex-col items-center justify-center h-full">
                <p className="text-muted-foreground">Your admin account profile could not be found.</p>
            </div>
        );
    }
    
    const { data: orgLink } = await supabase
        .from('user_organisations')
        .select('organisation_id')
        .eq('user_id', userRecord.id)
        .single();
    
    if (!orgLink) {
         return (
            <div className="flex flex-col items-center justify-center h-full">
                <p className="text-muted-foreground">Your admin account is not associated with a Living Space.</p>
            </div>
        );
    }

    const organisationId = orgLink.organisation_id;
    
    // Fetch pending approvals for the admin's organization.
    const { data: approvals, error: approvalsError } = await supabase
        .from('approvals')
        .select(`
            id,
            user_id,
            organisation_id,
            created_at,
            flat,
            user:user_id ( name, email, profile_image_url ),
            building_details:building_number_id (
                id,
                number,
                building:buildings ( id, name )
            )
        `)
        .eq('organisation_id', organisationId)
        .eq('is_approved', false)
        .order('created_at', { ascending: true });
    
    if (approvalsError) {
        console.error('Error fetching approvals:', approvalsError);
    }

    // Fetch all buildings and wings for the organization for the approval dialog
    const { data: buildingsData, error: buildingsError } = await supabase
        .from('buildings')
        .select(`
            id,
            name,
            building_numbers (
                id,
                number
            )
        `)
        .eq('organisation_id', organisationId)
        .order('name');
    
    if (buildingsError) {
        console.error('Error fetching buildings for dropdown:', buildingsError);
    }


    return (
        <div className="space-y-6">
            <ApprovalsClientPage approvals={approvals || []} buildings={buildingsData || []} />
        </div>
    );
}
