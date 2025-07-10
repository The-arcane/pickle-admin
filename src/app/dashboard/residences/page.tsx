import { createServer } from '@/lib/supabase/server';
import { ResidencesClientPage } from './client';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ResidencesPage() {
    const supabase = createServer();
    
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

    const organisationId = orgLink?.organisation_id;

    if (!organisationId) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <p className="text-muted-foreground">You are not associated with an organization.</p>
            </div>
        );
    }

    const { data: residences, error } = await supabase
        .from('residences')
        .select(`
            id,
            status,
            invited_at,
            joined_at,
            "Name",
            email,
            phone,
            user:user_id(profile_image_url)
        `)
        .eq('organisation_id', organisationId)
        .order('invited_at', { ascending: false });

    if (error) {
        console.error("Error fetching residences:", error);
    }
    
    return (
        <div className="space-y-6">
             <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Residences</h1>
                    <p className="text-muted-foreground">Manage and invite residents to your organization.</p>
                </div>
            </div>
            <ResidencesClientPage 
                initialResidences={residences || []} 
                organisationId={organisationId}
                loading={false}
            />
        </div>
    );
}
