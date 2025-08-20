
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

    // Get the admin's own user record to find their organization
    const { data: userRecord } = await supabase
        .from('user')
        .select('organisation_id')
        .eq('user_uuid', user.id)
        .single();
    
    if (!userRecord) {
        return redirect('/login');
    }

    const organisationId = userRecord.organisation_id;
    if (!organisationId) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <p className="text-muted-foreground">Your admin account is not associated with a Living Space.</p>
            </div>
        );
    }
    
    // Fetch pending approvals for the admin's organization
    const { data: approvals, error } = await supabase
        .from('approvals')
        .select(`
            id,
            user_id,
            organisation_id,
            created_at,
            user:user_id ( name, email, profile_image_url )
        `)
        .eq('organisation_id', organisationId)
        .eq('is_approved', false)
        .order('created_at', { ascending: true });
    
    if (error) {
        console.error('Error fetching approvals:', error);
    }

    return (
        <div className="space-y-6">
            <ApprovalsClientPage approvals={approvals || []} />
        </div>
    );
}
