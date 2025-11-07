
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Pencil, MoreHorizontal, Search, Globe, ShieldOff, List, Star, MapPin } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/status-badge';
import { useToast } from '@/hooks/use-toast';
import { updateCourtStatus } from '@/app/super-admin/courts/actions';
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
  image: string | null;
  rating: number | null;
  address: string | null;
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
    const { toast } = useToast();

    const filteredCourts = useMemo(() => {
        return courts.filter(court => {
            const venueMatch = venueFilter === 'all' || court.venue === venueFilter;
            const searchMatch = !searchQuery || court.name.toLowerCase().includes(searchQuery.toLowerCase());
            return venueMatch && searchMatch;
        });
    }, [courts, venueFilter, searchQuery]);
    
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
              <Link href="/livingspace/courts/add">+ Add Court</Link>
            </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourts.length > 0 ? (
                filteredCourts.map((court) => (
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
                                            <Link href={`/livingspace/courts/${court.id}`}>Edit</Link>
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
                        <div className="flex flex-col flex-grow">
                            <CardHeader className="p-4">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-lg truncate">{court.name}</CardTitle>
                                    {court.rating && (
                                        <div className="flex items-center gap-1 shrink-0 rounded-full bg-amber-100 dark:bg-amber-900/50 px-2 py-0.5">
                                            <Star className="h-3 w-3 text-amber-500 fill-amber-500"/>
                                            <span className="text-xs font-bold text-amber-700 dark:text-amber-300">{court.rating.toFixed(1)}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground gap-2 pt-1">
                                    <MapPin className="h-4 w-4 shrink-0" />
                                    <p className="truncate">{court.address}</p>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {court.is_public ? 
                                            <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-xs"><Globe className="h-3 w-3" /> Public</div> : 
                                            <div className="flex items-center gap-1 text-red-600 dark:text-red-400 text-xs"><ShieldOff className="h-3 w-3" /> Private</div>}
                                    </div>
                                    <StatusBadge status={court.status} />
                                </div>
                            </CardContent>
                        </div>
                        <CardFooter className="grid grid-cols-2 gap-2 p-2 pt-0 mt-auto">
                            <Button variant="outline" size="sm">Bookings</Button>
                            <Button variant="outline" size="sm">Manage Slots</Button>
                        </CardFooter>
                    </Card>
                ))
            ) : (
                <div className="col-span-full text-center text-muted-foreground py-10">
                    No courts found matching your criteria.
                </div>
            )}
        </div>
    </div>
  );
}
