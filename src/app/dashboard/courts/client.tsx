'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil } from 'lucide-react';
import { updateCourt } from './actions';
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Court = {
  id: number;
  name: string;
  venue: string | null;
  type: string | null;
  max_players: number | null;
  organisation_id: number;
  sport_id: number;
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
    const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
    const { toast } = useToast();

    const handleEditClick = (court: Court) => {
        setSelectedCourt(court);
        setIsEditDialogOpen(true);
    };
    
    const handleFormAction = async (formData: FormData) => {
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

  return (
    <>
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                <h1 className="text-3xl font-bold">Courts</h1>
                <p className="text-muted-foreground">Manage your court listings and availability.</p>
                </div>
                <Button>Add Court</Button>
            </div>
            <Card>
                <CardContent className="pt-6">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Court</TableHead>
                        <TableHead>Venue</TableHead>
                        <TableHead>Court Type</TableHead>
                        <TableHead>Max Players</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {courts.map((court) => (
                        <TableRow key={court.id}>
                        <TableCell className="font-medium">{court.name}</TableCell>
                        <TableCell>{court.venue || 'N/A'}</TableCell>
                        <TableCell>{court.type || 'N/A'}</TableCell>
                        <TableCell>{court.max_players || 'N/A'}</TableCell>
                        <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleEditClick(court)}>
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Edit court</span>
                            </Button>
                        </TableCell>
                        </TableRow>
                    ))}
                    {courts.length === 0 && (
                        <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                            No available courts found.
                        </TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>
        </div>

        {selectedCourt && (
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Court</DialogTitle>
                    </DialogHeader>
                    <form action={handleFormAction}>
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
    </>
  );
}
