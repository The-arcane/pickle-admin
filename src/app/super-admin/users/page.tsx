
'use client';
import { useState, useEffect } from 'react';
import { useOrganization } from '@/hooks/use-organization';
import { createClient } from '@/lib/supabase/client';
import { UsersClientPage } from './client';

export default function UsersPage() {
  const supabase = createClient();
  const { selectedOrgId } = useOrganization();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedOrgId) {
      setUsers([]);
      setLoading(false);
      return;
    };

    const fetchUsers = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_organisations')
        .select(`
            role:role_id ( name ),
            user:user_id!inner ( id, name, email, phone, profile_image_url, created_at, is_deleted )
        `)
        .eq('organisation_id', selectedOrgId);
      
      if (error) {
        console.error('Error fetching users:', error);
        setUsers([]);
      } else {
        setUsers(data as any[]);
      }
      setLoading(false);
    };

    fetchUsers();
  }, [selectedOrgId, supabase]);

  return <UsersClientPage users={users} loading={loading} />;
}
