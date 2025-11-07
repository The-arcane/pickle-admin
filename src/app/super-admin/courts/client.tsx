
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Pencil, Star, MapPin } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/status-badge';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
  image: string | null;
  rating: number | null;
  address: string | null;
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
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i}><CardContent className="p-4"><Skeleton className="h-48 w-full" /><Skeleton className="h-5 w-3/4 mt-4" /><Skeleton className="h-4 w-1/2 mt-2" /></CardContent></Card>
                ))
            ) : courts.length > 0 ? (
                courts.map((court) => (
                    <Card key={court.id} className="flex flex-col overflow-hidden">
                        <div className="relative">
                            <Image
                                src={court.image || `https://picsum.photos/seed/${court.id}/600/400`}
                                alt={court.name}
                                width={600}
                                height={400}
                                className="h-48 w-full object-cover"
                                data-ai-hint="pickleball court"
                            />
                             <div className="absolute top-2 right-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-background/80 hover:bg-background">
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem asChild>
                                            <Link href={`/super-admin/courts/${court.id}`}>Edit</Link>
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
                            </div>
                        </div>
                         <div className="flex flex-col flex-grow p-4 space-y-2">
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-base font-bold truncate">{court.name}</CardTitle>
                                {court.rating && (
                                    <div className="flex items-center gap-1 shrink-0 rounded-full bg-amber-100 dark:bg-amber-900/50 px-2 py-0.5">
                                        <Star className="h-3 w-3 text-amber-500 fill-amber-500"/>
                                        <span className="text-xs font-bold text-amber-700 dark:text-amber-300">{court.rating.toFixed(1)}</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center text-xs text-muted-foreground gap-2">
                                <MapPin className="h-3 w-3 shrink-0" />
                                <p className="truncate">{court.address}</p>
                            </div>
                            <div className="flex items-center justify-between pt-2">
                                <p className='capitalize text-xs text-muted-foreground'>{court.surface || 'N/A'}</p>
                                <StatusBadge status={court.status?.label ?? 'Unknown'} />
                            </div>
                        </div>
                    </Card>
                ))
            ) : (
                <div className="col-span-full text-center text-muted-foreground py-10">
                    No courts found for this Living Space. Select one from the dropdown above.
                </div>
            )}
        </div>
    </>
  );
}
