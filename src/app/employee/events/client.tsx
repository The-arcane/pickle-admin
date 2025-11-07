'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search } from 'lucide-react';
import { StatusBadge } from '@/components/status-badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
    const [statusFilter, setStatusFilter] = useState('all');

    const filteredEvents = useMemo(() => {
        return events.filter(event => {
            const searchMatch = !searchQuery || event.title.toLowerCase().includes(searchQuery.toLowerCase());
            const statusMatch = statusFilter === 'all' || event.status.toLowerCase() === statusFilter;
            return searchMatch && statusMatch;
        });
    }, [events, searchQuery, statusFilter]);

  return (
    <div className="space-y-6">
        <div>
            <h1 className="text-2xl font-bold">Event Management</h1>
            <p className="text-muted-foreground">View all scheduled events.</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-grow sm:flex-grow-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Search for events..." 
                    className="pl-10 w-full sm:w-64"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                />
            </div>
             <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
            </Select>
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
