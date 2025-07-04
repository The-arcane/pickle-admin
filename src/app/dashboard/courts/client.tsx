'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Pencil, MoreVertical, Search } from 'lucide-react';
import { addCourt, updateCourt } from './actions';
import { useToast } from "@/hooks/use-toast";
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
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
    const { toast } = useToast();

    const [venueFilter, setVenueFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredCourts = useMemo(() => {
        return courts.filter(court => {
            const venueMatch = venueFilter === 'all' || court.venue === venueFilter;
            const searchMatch = !searchQuery || court.name.toLowerCase().includes(searchQuery.toLowerCase());
            return venueMatch && searchMatch;
        });
    }, [courts, venueFilter, searchQuery]);


    const handleEditClick = (court: Court) => {
        setSelectedCourt(court);
        setIsEditDialogOpen(true);
    };
    
    const handleUpdateFormAction = async (formData: FormData) => {
        const result = await updateCourt(formData);
        if (result.error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: result.error,
            });
        } else {
            toast({
                title: "Success",
                description: "Court updated successfully.",
            });
            setIsEditDialogOpen(false);
            setSelectedCourt(null);
        }
    }
    
    const handleAddFormAction = async (formData: FormData) => {
        const result = await addCourt(formData);
        if (result.error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: result.error,
            });
        } else {
            toast({
                title: "Success",
                description: "Court added successfully.",
            });
            setIsAddDialogOpen(false);
        }
    }

  return (
    <>
        <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Court Management</h1>
              <p className="text-muted-foreground">Manage your courts and their availability</p>
            </div>

            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <Select value={venueFilter} onValueChange={setVenueFilter}>
                        <SelectTrigger className="w-auto md:w-[180px]">
                            <span className="hidden md:inline">Venue: </span><span>{venueFilter === 'all' ? 'All Venues' : organisations.find(o => o.name === venueFilter)?.name ?? 'All Venues'}</span>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Venues</SelectItem>
                            {organisations.map(org => (
                                <SelectItem key={org.id} value={org.name}>{org.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <div className="relative flex-grow md:flex-grow-0">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search for courts..." 
                            className="pl-10 w-full"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <Button onClick={() => setIsAddDialogOpen(true)}>+ Add Court</Button>
            </div>
            
            <Card>
                <CardContent className="pt-0">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Court</TableHead>
                        <TableHead>Venue</TableHead>
                        <TableHead>Court Type</TableHead>
                        <TableHead>Max Players</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {filteredCourts.map((court) => (
                        <TableRow key={court.id}>
                        <TableCell className="font-medium">{court.name}</TableCell>
                        <TableCell>{court.venue || 'N/A'}</TableCell>
                        <TableCell>{court.type || 'N/A'}</TableCell>
                        <TableCell>{court.max_players || 'N/A'}</TableCell>
                        <TableCell>
                            <StatusBadge status={court.status} />
                        </TableCell>
                        <TableCell className="text-right">
                           <div className="flex items-center justify-end gap-1">
                                <Button variant="ghost" size="icon">
                                    <Eye className="h-4 w-4" />
                                    <span className="sr-only">View court</span>
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleEditClick(court)}>
                                    <Pencil className="h-4 w-4" />
                                    <span className="sr-only">Edit court</span>
                                </Button>
                                <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                    <span className="sr-only">More actions</span>
                                </Button>
                            </div>
                        </TableCell>
                        </TableRow>
                    ))}
                    {filteredCourts.length === 0 && (
                        <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground h-24">
                            No courts found matching your criteria.
                        </TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>
        </div>

        {/* Edit Court Dialog */}
        {selectedCourt && (
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Court</DialogTitle>
                    </DialogHeader>
                    <form action={handleUpdateFormAction}>
                        <input type="hidden" name="id" value={selectedCourt.id} />
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Court Name</Label>
                                <Input id="name" name="name" defaultValue={selectedCourt.name} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="organisation_id">Venue</Label>
                                <Select name="organisation_id" defaultValue={selectedCourt.organisation_id.toString()}>
                                    <SelectTrigger id="organisation_id">
                                        <SelectValue placeholder="Select venue" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {organisations.map((org) => (
                                            <SelectItem key={org.id} value={org.id.toString()}>{org.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="sport_id">Court Type</Label>
                                <Select name="sport_id" defaultValue={selectedCourt.sport_id.toString()}>
                                    <SelectTrigger id="sport_id">
                                        <SelectValue placeholder="Select court type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sports.map((sport) => (
                                            <SelectItem key={sport.id} value={sport.id.toString()}>{sport.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button type="submit">Save Changes</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        )}

        {/* Add Court Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Court</DialogTitle>
                </DialogHeader>
                <form action={handleAddFormAction}>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="add_name">Court Name</Label>
                            <Input id="add_name" name="name" placeholder="e.g., Center Court" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="add_organisation_id">Venue</Label>
                            <Select name="organisation_id">
                                <SelectTrigger id="add_organisation_id">
                                    <SelectValue placeholder="Select venue" />
                                </SelectTrigger>
                                <SelectContent>
                                    {organisations.map((org) => (
                                        <SelectItem key={org.id} value={org.id.toString()}>{org.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                            <div className="space-y-2">
                            <Label htmlFor="add_sport_id">Court Type</Label>
                            <Select name="sport_id">
                                <SelectTrigger id="add_sport_id">
                                    <SelectValue placeholder="Select court type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {sports.map((sport) => (
                                        <SelectItem key={sport.id} value={sport.id.toString()}>{sport.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit">Add Court</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    </>
  );
}
