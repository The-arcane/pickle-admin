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
import { Badge } from '@/components/ui/badge';
import { useOrganization } from '@/hooks/use-organization';
import { Card } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import type { Court } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function CourtsPage() {
  const supabase = createClient();
  const { selectedOrgId } = useOrganization();
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedOrgId) {
      setCourts([]);
      return;
    };

    const fetchCourts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('courts')
        .select('*')
        .eq('organization_id', selectedOrgId);

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

  const getStatusVariant = (status: 'available' | 'booked' | 'maintenance') => {
    switch (status) {
      case 'available':
        return 'bg-green-500/20 text-green-700 border-green-500/20';
      case 'booked':
        return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/20';
      case 'maintenance':
        return 'bg-red-500/20 text-red-700 border-red-500/20';
      default:
        return 'secondary';
    }
  };

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
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                </TableRow>
              ))
            ) : courts.length > 0 ? (
              courts.map((court) => (
                <TableRow key={court.id}>
                  <TableCell className="font-medium">{court.name}</TableCell>
                  <TableCell className='capitalize'>{court.type}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusVariant(court.status)}>
                      {court.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
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
