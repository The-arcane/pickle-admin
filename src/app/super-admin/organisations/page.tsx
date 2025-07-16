
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

    const { data: orgsData, error: orgsError } = await supabase.from('organisations').select('*').order('name');
    if (orgsError) {
        console.error("Error fetching orgs:", orgsError);
    }
    
    // Fetch all users to populate the "owner" dropdown in the form
    const { data: usersData, error: usersError } = await supabase.from('user').select('id, name').eq('user_type', 2).order('name');
    if(usersError) {
        console.error("Error fetching users:", usersError);
    }
    
    return (
        <OrganisationsClientPage 
            initialOrganizations={orgsData as Organization[] || []} 
            users={usersData as User[] || []} 
        />
    );
}
