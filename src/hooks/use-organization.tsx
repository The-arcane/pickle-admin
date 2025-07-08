'use client';

import { createClient } from '@/lib/supabase/client';
import {
  useState,
  useEffect,
  createContext,
  useContext,
  useCallback,
} from 'react';
import type { Organization } from '@/types';

type OrganizationContextType = {
  organizations: Organization[];
  selectedOrgId: number | null;
  setSelectedOrgId: (id: number | null) => void;
  refreshOrganizations: () => void;
  loading: boolean;
};

const OrganizationContext = createContext<OrganizationContextType | undefined>(
  undefined
);

export function OrganizationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrgId, setSelectedOrgIdState] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrganizations = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('organisations').select('*');
    if (error) {
      console.error('Error fetching organizations:', error);
      setOrganizations([]);
    } else {
      setOrganizations(data as Organization[]);
      // Set initial selected org
      if (data && data.length > 0 && selectedOrgId === null) {
        const storedOrgId = localStorage.getItem('selectedOrgId');
        if (storedOrgId && data.some(org => org.id === parseInt(storedOrgId))) {
            setSelectedOrgIdState(parseInt(storedOrgId));
        } else {
            const firstOrgId = data[0].id;
            setSelectedOrgIdState(firstOrgId);
            localStorage.setItem('selectedOrgId', firstOrgId.toString());
        }
      }
    }
    setLoading(false);
  }, [supabase, selectedOrgId]);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  const setSelectedOrgId = (id: number | null) => {
    setSelectedOrgIdState(id);
    if (id !== null) {
      localStorage.setItem('selectedOrgId', id.toString());
    } else {
      localStorage.removeItem('selectedOrgId');
    }
  };
  
  const refreshOrganizations = () => {
      fetchOrganizations();
  };

  return (
    <OrganizationContext.Provider
      value={{ organizations, selectedOrgId, setSelectedOrgId, refreshOrganizations, loading }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error(
      'useOrganization must be used within an OrganizationProvider'
    );
  }
  return context;
}
