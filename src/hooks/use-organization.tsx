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
    const { data, error } = await supabase.from('organisations').select('*').order('name');
    if (error) {
      console.error('Error fetching organizations:', error);
      setOrganizations([]);
    } else {
      const orgs = data as Organization[];
      setOrganizations(orgs);
      
      if (orgs.length > 0) {
        setSelectedOrgIdState(currentId => {
            if (currentId && orgs.some(org => org.id === currentId)) {
                return currentId;
            }
            const storedOrgId = localStorage.getItem('selectedOrgId');
            if (storedOrgId) {
                const storedIdNum = parseInt(storedOrgId);
                if (orgs.some(org => org.id === storedIdNum)) {
                    return storedIdNum;
                }
            }
            // Fallback to the first organization
            const firstOrgId = orgs[0].id;
            localStorage.setItem('selectedOrgId', firstOrgId.toString());
            return firstOrgId;
        });
      } else {
          setSelectedOrgIdState(null);
          localStorage.removeItem('selectedOrgId');
      }
    }
    setLoading(false);
  }, [supabase]);

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
