
import { createServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { OrganisationsClientPage } from './client';
import type { Organization, User } from '@/types';

export default async function OrganizationsPage() {
    const supabase = await createServer();
    
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
        return redirect('/login?type=super-admin');
    }
    
    // Find the ID for the 'residences' organization type.
    const { data: residenceType } = await supabase
        .from('organisation_types')
        .select('id')
        .eq('type_name', 'residences')
        .single();
    
    let orgsData: any[] = [];
    if (residenceType) {
        const { data, error } = await supabase
            .from('organisations')
            .select('*')
            .eq('type', residenceType.id)
            .order('name');
        
        if (error) {
            console.error("Error fetching residence orgs:", error);
        } else {
            orgsData = data || [];
        }
    } else {
        console.error("Could not find 'residences' in organisation_types table.");
    }
    
    // Fetch admin users (user_type 2) who are NOT linked to any organization yet.
    const { data: usersData, error: usersError } = await supabase
        .from('user')
        .select('id, name, email, user_organisations!left(user_id)')
        .eq('user_type', 2)
        .is('user_organisations.user_id', null)
        .order('name');
        
    if(usersError) {
        console.error("Error fetching unassigned users:", usersError);
    }
    
    return (
        <OrganisationsClientPage 
            initialOrganizations={orgsData as Organization[] || []} 
            users={usersData as User[] || []} 
        />
    );
}
