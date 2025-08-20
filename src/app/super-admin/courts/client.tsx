
'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Pencil } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/status-badge';

type Court = {
  id: number;
  name: string;
  surface: string | null;
  status: string;
  sports: { name: string } | null;
};

export function CourtsClientPage({ courts, loading }: { courts: Court[], loading: boolean }) {
  
  return (
    <>
      <div className="flex items-center justify-between">
        <PageHeader title="Courts" description="View and manage courts for the selected Living Space." />
        <Button asChild>
            <Link href="/super-admin/courts/add">+ Add Court</Link>
        </Button>
      </div>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Surface</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : courts.length > 0 ? (
              courts.map((court) => (
                <TableRow key={court.id}>
                  <TableCell className="font-medium">{court.name}</TableCell>
                  <TableCell>{court.sports?.name || 'N/A'}</TableCell>
                  <TableCell className='capitalize'>{court.surface || 'N/A'}</TableCell>
                  <TableCell><StatusBadge status={court.status} /></TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="icon">
                        <Link href={`/super-admin/courts/${court.id}`}>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit court</span>
                        </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No courts found for this Living Space.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
