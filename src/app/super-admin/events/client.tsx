
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { MoreHorizontal, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { deleteEvent } from './actions';
import { useToast } from '@/hooks/use-toast';
import type { Event } from '@/types';


export function EventsClientPage({ events, loading, onActionFinish }: { events: Event[], loading: boolean, onActionFinish: () => void }) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingEventId, setDeletingEventId] = useState<number | null>(null);
  const { toast } = useToast();

  const getStatus = (event: Event) => {
    const now = new Date();
    const endTime = new Date(event.end_time);
    if (endTime < now) {
        return 'Completed';
    }
    return 'Upcoming';
  }

  const getStatusVariant = (status: 'Upcoming' | 'Completed') => {
    switch (status) {
      case 'Upcoming':
        return 'bg-blue-500/20 text-blue-700 border-blue-500/20';
      case 'Completed':
        return 'bg-green-500/20 text-green-700 border-green-500/20';
      default:
        return 'secondary';
    }
  };
  
  const openDeleteDialog = (eventId: number) => {
    setDeletingEventId(eventId);
    setIsDeleteDialogOpen(true);
  }

  async function handleDelete() {
    if (!deletingEventId) return;
    const formData = new FormData();
    formData.append('id', deletingEventId.toString());

    const result = await deleteEvent(formData);
    if (result?.error) {
        toast({ variant: 'destructive', title: 'Error', description: result.error });
    } else {
        toast({ title: 'Success', description: 'Event deleted.' });
    }
    setIsDeleteDialogOpen(false);
    onActionFinish();
}

  return (
    <>
      <div className="flex items-center justify-between">
        <PageHeader title="Events" description="View and manage events for the selected Living Space." />
        <Button asChild size="sm" className="gap-1"><Link href="/super-admin/events/add"><PlusCircle className="h-4 w-4" /> Add Event</Link></Button>
      </div>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
             {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : events.length > 0 ? (
              events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">{event.title}</TableCell>
                  <TableCell>{format(new Date(event.start_time), 'PPP')}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusVariant(getStatus(event))}>
                      {getStatus(event)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button aria-haspopup="true" size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild><Link href={`/super-admin/events/${event.id}`}><Edit className="mr-2 h-4 w-4" />Edit</Link></DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={() => openDeleteDialog(event.id)}><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No events found for this Living Space.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>This action cannot be undone. This will permanently delete the event.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
