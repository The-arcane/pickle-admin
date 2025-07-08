'use client';

import { useState, useEffect, useCallback } from 'react';
import { useOrganization } from '@/hooks/use-organization';
import { createClient } from '@/lib/supabase/client';
import { ResidencesClientPage } from '@/app/dashboard/residences/client';
import { PageHeader } from '@/components/page-header';

export default function SuperAdminResidencesPage() {
    const supabase = createClient();
    const { selectedOrgId } = useOrganization();
    const [residences, setResidences] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchResidences = useCallback(async () => {
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
                "Name",
                email,
                phone,
                user:user_id(profile_image_url)
            `)
            .eq('organisation_id', selectedOrgId)
            .order('invited_at', { ascending: false });
        
        if (error) {
            console.error("Error fetching residences for super admin:", error);
            setResidences([]);
        } else {
            setResidences(data || []);
        }
        setLoading(false);
    }, [selectedOrgId, supabase]);

    useEffect(() => {
        fetchResidences();
    }, [fetchResidences]);

    return (
        <div className="space-y-6">
            <PageHeader 
                title="Residences"
                description="Manage and invite residents for the selected organization."
            />
            <ResidencesClientPage
                initialResidences={residences}
                organisationId={selectedOrgId}
                loading={loading}
                onActionFinish={fetchResidences}
            />
        </div>
    );
}
