'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Pencil, Search } from 'lucide-react';
import { StatusBadge } from '@/components/status-badge';

type Event = {
  id: number;
  title: string;
  category: string;
  dates: string;
  location: string;
  price: string;
  status: 'Upcoming' | 'Completed' | 'Cancelled';
};

export function EventsClientPage({ events }: { events: Event[] }) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredEvents = useMemo(() => {
        return events.filter(event => {
            return !searchQuery || event.title.toLowerCase().includes(searchQuery.toLowerCase());
        });
    }, [events, searchQuery]);

  return (
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
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {filteredEvents.map((event) => (
                    <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.title}</TableCell>
                    <TableCell>{event.category}</TableCell>
                    <TableCell>{event.dates}</TableCell>
                    <TableCell>{event.location}</TableCell>
                    <TableCell>{event.price}</TableCell>
                    <TableCell>
                        <StatusBadge status={event.status} />
                    </TableCell>
                    <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                            <Button asChild variant="ghost" size="icon">
                              <Link href={`/dashboard/events/${event.id}`}>
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Edit event</span>
                              </Link>
                            </Button>
                        </div>
                    </TableCell>
                    </TableRow>
                ))}
                {filteredEvents.length === 0 && (
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
  );
}
