
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
    
    // Fetch all admin users (user_type 2)
    const { data: allAdmins, error: usersError } = await supabase.from('user').select('id, name, email').eq('user_type', 2).order('name');
    if (usersError) {
        console.error("Error fetching admin users:", usersError);
    }

    // Fetch all user_organisation links to find assigned admins
    const { data: assignedLinks, error: linksError } = await supabase.from('user_organisations').select('user_id');
    if(linksError) {
        console.error("Error fetching assigned user links:", linksError);
    }
    const assignedUserIds = new Set((assignedLinks || []).map(link => link.user_id));

    // Filter for unassigned admins
    const unassignedAdmins = (allAdmins || []).filter(admin => !assignedUserIds.has(admin.id));
    
    return (
        <OrganisationsClientPage 
            initialOrganizations={orgsData as Organization[] || []} 
            users={unassignedAdmins as User[] || []} 
        />
    );
}
