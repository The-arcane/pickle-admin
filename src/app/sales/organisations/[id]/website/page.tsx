
import { createServer } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { EditWebsiteClientPage } from './client';
import type { Organization, OrganisationWebsite } from '@/types';

export default async function EditOrganizationWebsitePage({ params }: { params: { id: string } }) {
    const supabase = await createServer();
    const { id } = params;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return redirect('/login?type=sales');
    }

    const { data: organization, error: orgError } = await supabase
        .from('organisations')
        .select('*')
        .eq('id', id)
        .eq('is_active', false) // Sales can only edit inactive orgs
        .single();
    
    if (orgError || !organization) {
        notFound();
    }
    
    const { data: websiteDetails, error: websiteError } = await supabase
        .from('organisations_website')
        .select('*')
        .eq('org_id', id)
        .maybeSingle();
        
    if(websiteError) {
        console.error("Error fetching website details:", websiteError);
    }
    
    return (
        <EditWebsiteClientPage
            organization={organization as Organization}
            websiteDetails={websiteDetails as OrganisationWebsite | null}
        />
    );
}
