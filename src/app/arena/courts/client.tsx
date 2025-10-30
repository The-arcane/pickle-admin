
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Pencil, MoreVertical, Search, Globe, ShieldOff, List } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/status-badge';

type Court = {
  id: number;
  name: string;
  venue: string | null;
  type: string | null;
  max_players: number | null;
  organisation_id: number;
  sport_id: number;
  status: string;
  is_public: boolean | null;
};

type Organisation = {
    id: number;
    name: string;
}

type Sport = {
    id: number;
    name: string;
}

export function CourtsClientPage({ courts, organisations, sports }: { courts: Court[], organisations: Organisation[], sports: Sport[] }) {
    const [venueFilter, setVenueFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredCourts = useMemo(() => {
        return courts.filter(court => {
            const venueMatch = venueFilter === 'all' || court.venue === venueFilter;
            const searchMatch = !searchQuery || court.name.toLowerCase().includes(searchQuery.toLowerCase());
            return venueMatch && searchMatch;
        });
    }, [courts, venueFilter, searchQuery]);

  return (
    <div className="space-y-6">
        <div className="flex items-center gap-3">
            <List className="h-8 w-8 text-amber-500" />
            <div>
                <h1 className="text-3xl font-bold">Court Management</h1>
                <p className="text-muted-foreground">Manage your courts and their availability</p>
            </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full">
                <div className="relative flex-grow w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search for courts..." 
                        className="pl-10 w-full"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                <Select value={venueFilter} onValueChange={setVenueFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                         <SelectValue placeholder="All Venues" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Venues</SelectItem>
                        {organisations.map(org => (
                            <SelectItem key={org.id} value={org.name}>{org.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <Button asChild className="w-full sm:w-auto flex-shrink-0">
              <Link href="/arena/courts/add">+ Add Court</Link>
            </Button>
        </div>
        
        <Card>
            <CardContent className="pt-0">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Court</TableHead>
                        <TableHead className="hidden md:table-cell">Venue</TableHead>
                        <TableHead className="hidden sm:table-cell">Type</TableHead>
                        <TableHead className="hidden md:table-cell">Max Players</TableHead>
                        <TableHead>Visibility</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {filteredCourts.map((court) => (
                        <TableRow key={court.id}>
                        <TableCell className="font-medium">{court.name}</TableCell>
                        <TableCell className="hidden md:table-cell">{court.venue || 'N/A'}</TableCell>
                        <TableCell className="hidden sm:table-cell">{court.type || 'N/A'}</TableCell>
                        <TableCell className="hidden md:table-cell">{court.max_players || 'N/A'}</TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                            {court.is_public ? <Globe className="h-4 w-4 text-green-500" /> : <ShieldOff className="h-4 w-4 text-red-500" />}
                            <span className="capitalize hidden sm:inline">{court.is_public ? 'Public' : 'Private'}</span>
                            </div>
                        </TableCell>
                        <TableCell>
                            <StatusBadge status={court.status} />
                        </TableCell>
                        <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                                <Button asChild variant="ghost" size="icon">
                                <Link href={`/arena/courts/${court.id}`}>
                                    <Pencil className="h-4 w-4" />
                                    <span className="sr-only">Edit court</span>
                                </Link>
                                </Button>
                            </div>
                        </TableCell>
                        </TableRow>
                    ))}
                    {filteredCourts.length === 0 && (
                        <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground h-24">
                            No courts found matching your criteria.
                        </TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                </Table>
            </div>
            </CardContent>
        </Card>
    </div>
  );
}
