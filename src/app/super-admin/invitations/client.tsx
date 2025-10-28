
'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { InvitationsClientPage as DashboardInvitationsClientPage } from '@/app/dashboard/invitations/client';
import { PageHeader } from '@/components/page-header';
import type { Organization } from '@/types';
import { useOrganization } from '@/hooks/use-organization';

export function SuperAdminInvitationsClient({ initialOrganizations }: { initialOrganizations: Organization[] }) {
    const supabase = createClient();
    const { selectedOrgId, setSelectedOrgId, loading: orgLoading } = useOrganization();
    const [residences, setResidences] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchInvitations = useCallback(async () => {
        if (!selectedOrgId) {
            setResidences([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const { data, error } = await supabase
            .from('residences')
            .select(`
                id,
                status,
                invited_at,
                joined_at,
                name,
                email,
                phone,
                user:user_id(profile_image_url)
            `)
            .eq('organisation_id', selectedOrgId)
            .order('invited_at', { ascending: false });
        
        if (error) {
            console.error("Error fetching invitations for super admin:", error);
            setResidences([]);
        } else {
            const processedData = data?.map(r => ({ ...r, "Name": r.name })) || [];
            setResidences(processedData);
        }
        setLoading(false);
    }, [selectedOrgId, supabase]);

    useEffect(() => {
        if (selectedOrgId) {
            fetchInvitations();
        }
    }, [selectedOrgId, fetchInvitations]);

    return (
        <div className="space-y-6">
            <PageHeader 
                title="Invitations"
                description="Manage and send invitations for the selected Living Space."
            />
            <DashboardInvitationsClientPage
                initialResidences={residences}
                organisationId={selectedOrgId}
                loading={orgLoading || loading}
                onActionFinish={fetchInvitations}
            />
        </div>
    );
}
