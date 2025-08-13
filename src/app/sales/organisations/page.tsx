
import { createServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { SalesOrganisationsClientPage } from './client';
import type { Organization, User } from '@/types';

export default async function SalesOrganizationsPage() {
    const supabase = await createServer();
    
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
        return redirect('/login?type=sales');
    }

    // Sales users can only see INACTIVE organizations
    const { data: orgsData, error: orgsError } = await supabase
        .from('organisations')
        .select('*')
        .eq('is_active', false)
        .order('name');
        
    if (orgsError) {
        console.error("Error fetching inactive orgs for sales:", orgsError);
    }
    
    // Fetch all admin users to populate the "owner" dropdown in the form
    const { data: usersData, error: usersError } = await supabase.from('user').select('id, name').eq('user_type', 2).order('name');
    if(usersError) {
        console.error("Error fetching admin users:", usersError);
    }
    
    return (
        <SalesOrganisationsClientPage 
            initialOrganizations={orgsData as Organization[] || []} 
            users={usersData as User[] || []} 
        />
    );
}
