'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { PartyPopper, PlusCircle, MoreHorizontal } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Mock Data for Events
const mockEvents = [
  {
    id: 'event_001',
    name: 'Annual Pickleball Championship',
    type: 'Tournament',
    startDate: new Date(new Date().setDate(new Date().getDate() + 10)),
    endDate: new Date(new Date().setDate(new Date().getDate() + 12)),
    venue: 'Main Sports Complex',
    status: 'Upcoming',
  },
  {
    id: 'event_002',
    name: 'Friendly Match vs. Green Aces',
    type: 'Friendly',
    startDate: new Date(new Date().setDate(new Date().getDate() - 2)),
    endDate: new Date(new Date().setDate(new Date().getDate() - 2)),
    venue: 'Court 3',
    status: 'Completed',
  },
  {
    id: 'event_003',
    name: 'Intra-School League - Week 2',
    type: 'League',
    startDate: new Date(),
    endDate: new Date(),
    venue: 'All Courts',
    status: 'Ongoing',
  },
];

const getStatusColor = (status: string) => {
    switch (status) {
        case 'Upcoming': return 'bg-green-500/20 text-green-700 border-green-500/20';
        case 'Ongoing': return 'bg-blue-500/20 text-blue-700 border-blue-500/20';
        case 'Completed': return 'bg-gray-500/20 text-gray-700 border-gray-500/20';
        default: return 'secondary';
    }
}


export default function EventsListPage() {
  const [events, setEvents] = useState(mockEvents);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <PartyPopper className="h-8 w-8 text-pink-500" />
          <div>
            <h1 className="text-3xl font-bold">Event Management</h1>
            <p className="text-muted-foreground">Schedule, manage, and track all school pickleball events.</p>
          </div>
        </div>
        <Button asChild>
          <Link href="/education/events/add">
            <PlusCircle className="mr-2 h-4 w-4" /> Create Event
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scheduled Events</CardTitle>
          <CardDescription>A list of all upcoming, ongoing, and completed events.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event Name</TableHead>
                <TableHead className="hidden md:table-cell">Type</TableHead>
                <TableHead className="hidden sm:table-cell">Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.length > 0 ? (
                events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.name}</TableCell>
                    <TableCell className="hidden md:table-cell">{event.type}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {format(event.startDate, 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                        <Badge variant="outline" className={getStatusColor(event.status)}>{event.status}</Badge>
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
                                <DropdownMenuItem asChild>
                                    <Link href={`/education/events/${event.id}`}>Manage Event</Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No events scheduled.
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
