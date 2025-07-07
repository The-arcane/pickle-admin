'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search } from 'lucide-react';
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

export function EmployeeEventsClientPage({ events }: { events: Event[] }) {
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
            <p className="text-muted-foreground">View all scheduled events.</p>
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
                    </TableRow>
                ))}
                {filteredEvents.length === 0 && (
                    <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground h-24">
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
