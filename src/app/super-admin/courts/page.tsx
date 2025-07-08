'use client';
import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/page-header';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useOrganization } from '@/hooks/use-organization';
import { Card } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import type { Court } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function CourtsPage() {
  const supabase = createClient();
  const { selectedOrgId } = useOrganization();
  const [courts, setCourts] = useState<Pick<Court, 'id' | 'name' | 'surface'>[]>([]);
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
        .select('id, name, surface')
        .eq('organisation_id', selectedOrgId);

      if (error) {
        console.error('Error fetching courts:', error);
        setCourts([]);
      } else {
        setCourts(data as Court[]);
      }
      setLoading(false);
    };

    fetchCourts();
  }, [selectedOrgId, supabase]);


  return (
    <>
      <PageHeader
        title="Courts"
        description="View all courts for the selected organization."
      />
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Surface</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                </TableRow>
              ))
            ) : courts.length > 0 ? (
              courts.map((court) => (
                <TableRow key={court.id}>
                  <TableCell className="font-medium">{court.name}</TableCell>
                  <TableCell className='capitalize'>{court.surface || 'N/A'}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} className="h-24 text-center">
                  No courts found for this organization.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
