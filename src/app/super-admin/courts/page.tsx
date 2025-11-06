
'use client';
import { useState, useEffect } from 'react';
import { useOrganization } from '@/hooks/use-organization';
import { createClient } from '@/lib/supabase/client';
import { CourtsClientPage } from './client';

export default function CourtsPage() {
  const supabase = createClient();
  const { selectedOrgId } = useOrganization();
  const [courts, setCourts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedOrgId) {
      setCourts([]);
      setLoading(false);
      return;
    };

    const fetchCourts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('courts')
        .select('id, name, surface, status, sports(name)')
        .eq('organisation_id', selectedOrgId);

      if (error) {
        console.error('Error fetching courts:', error);
        setCourts([]);
      } else {
        setCourts(data || []);
      }
      setLoading(false);
    };

    fetchCourts();
  }, [selectedOrgId, supabase]);


  return <CourtsClientPage courts={courts} loading={loading} />;
}
