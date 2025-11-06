
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
import { Pencil, MoreHorizontal } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/status-badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { updateCourtStatus } from './actions';

type Court = {
  id: number;
  name: string;
  surface: string | null;
  status: { id: number, label: string } | null;
  sports: { name: string } | null;
};

export function CourtsClientPage({ courts, loading }: { courts: Court[], loading: boolean }) {
  const { toast } = useToast();

  const handleStatusChange = async (courtId: number, statusId: number) => {
    const formData = new FormData();
    formData.append('courtId', courtId.toString());
    formData.append('statusId', statusId.toString());

    const result = await updateCourtStatus(formData);
    if (result.error) {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    } else {
      toast({ title: 'Success', description: result.message });
    }
  };
  
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
                  <TableCell><StatusBadge status={court.status?.label ?? 'Unknown'} /></TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                           <Link href={`/super-admin/courts/${court.id}`}><Pencil className="mr-2 h-4 w-4" />Edit</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSub>
                           <DropdownMenuSubTrigger>Change Status</DropdownMenuSubTrigger>
                           <DropdownMenuSubContent>
                                <DropdownMenuItem onSelect={() => handleStatusChange(court.id, 1)}>Open</DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => handleStatusChange(court.id, 3)}>Maintenance</DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => handleStatusChange(court.id, 2)}>Closed</DropdownMenuItem>
                           </DropdownMenuSubContent>
                        </DropdownMenuSub>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
