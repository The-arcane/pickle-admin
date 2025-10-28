
import { createServer } from '@/lib/supabase/server';
import { SuperAdminInvitationsClient } from './client';
import type { Organization } from '@/types';
import { redirect } from 'next/navigation';


export default async function SuperAdminInvitationsPage() {
    const supabase = await createServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return redirect('/login?type=super-admin');
    }

    const { data: organizations, error } = await supabase
        .from('organisations')
        .select('*')
        .order('name');
    
    if (error) {
        console.error("Error fetching organizations in super admin:", error);
    }

    return <SuperAdminInvitationsClient initialOrganizations={organizations as Organization[] || []} />;
}
