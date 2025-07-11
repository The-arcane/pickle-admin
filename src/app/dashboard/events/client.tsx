
'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, Pencil, Search, Trash2, Globe, ShieldOff } from 'lucide-react';
import { StatusBadge } from '@/components/status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { deleteEvent } from './actions';
import { useToast } from '@/hooks/use-toast';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type Event = {
  id: number;
  title: string;
  category: string;
  dates: string;
  location: string;
  price: string;
  status: 'Upcoming' | 'Completed' | 'Cancelled';
  is_public: boolean | null;
};

export function EventsClientPage({ events }: { events: Event[] }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isClient, setIsClient] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingEventId, setDeletingEventId] = useState<number | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        setIsClient(true);
    }, []);

    const filteredEvents = useMemo(() => {
        return events.filter(event => {
            return !searchQuery || event.title.toLowerCase().includes(searchQuery.toLowerCase());
        });
    }, [events, searchQuery]);

    const openDeleteDialog = (eventId: number) => {
        setDeletingEventId(eventId);
        setIsDeleteDialogOpen(true);
    };

    async function handleDelete() {
        if (!deletingEventId) return;
        const formData = new FormData();
        formData.append('id', deletingEventId.toString());

        const result = await deleteEvent(formData);
        if (result?.error) {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        } else {
            toast({ title: 'Success', description: 'Event deleted successfully.' });
        }
        setIsDeleteDialogOpen(false);
        setDeletingEventId(null);
    }

  return (
    <>
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Event Management</h1>
                <p className="text-muted-foreground">Manage your events, bookings, and schedules.</p>
            </div>

            <div className="flex items-center justify-between gap-4">
                <div className="relative flex-grow md:flex-grow-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search for events..." 
                        className="pl-10 w-full md:w-80"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button asChild>
                <Link href="/dashboard/events/add">+ Add Event</Link>
                </Button>
            </div>
            
            <Card>
                <CardContent className="pt-6">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Event</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Dates</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Visibility</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {!isClient ? (
                        Array.from({ length: 5 }).map((_, index) => (
                            <TableRow key={`skel-${index}`}>
                                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                            </TableRow>
                        ))
                    ) : filteredEvents.length > 0 ? (
                        filteredEvents.map((event) => (
                        <TableRow key={event.id}>
                        <TableCell className="font-medium">{event.title}</TableCell>
                        <TableCell>{event.category}</TableCell>
                        <TableCell>{event.dates}</TableCell>
                        <TableCell>{event.location}</TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                               {event.is_public ? <Globe className="h-4 w-4 text-green-500" /> : <ShieldOff className="h-4 w-4 text-red-500" />}
                               <span>{event.is_public ? 'Public' : 'Private'}</span>
                            </div>
                        </TableCell>
                        <TableCell>
                            <StatusBadge status={event.status} />
                        </TableCell>
                        <TableCell className="text-right">
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">More actions</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem asChild>
                                        <Link href={`/dashboard/events/${event.id}`}>
                                            <Pencil className="mr-2 h-4 w-4" />
                                            <span>Edit</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-destructive" onSelect={() => openDeleteDialog(event.id)}>
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        <span>Delete</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                        </TableRow>
                    ))
                    ) : (
                        <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground h-24">
                            No events found matching your criteria.
                        </TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>
        </div>
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the event and all of its associated data.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>
  );
}
