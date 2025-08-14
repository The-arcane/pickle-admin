
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Handshake, PlusCircle, Edit } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';

// Mock Data
const mockSponsors = [
    { id: 'sp_001', name: 'SportsWorld Pvt Ltd', pledged: 50000, received: 30000, logo: 'https://placehold.co/40x40.png' },
    { id: 'sp_002', name: 'HealthyLife Foods', pledged: 30000, received: 30000, logo: 'https://placehold.co/40x40.png' },
    { id: 'sp_003', name: 'Local Heroes Foundation', pledged: 75000, received: 25000, logo: null },
];

export default function SponsorshipPage() {
    const [sponsors, setSponsors] = useState(mockSponsors);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingSponsor, setEditingSponsor] = useState<any>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const { toast } = useToast();

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const newSponsor = {
            id: editingSponsor ? editingSponsor.id : `sp_${Date.now()}`,
            name: formData.get('name') as string,
            pledged: parseInt(formData.get('pledged') as string, 10),
            received: parseInt(formData.get('received') as string, 10),
            logo: logoPreview,
        };

        if (editingSponsor) {
            setSponsors(prev => prev.map(s => s.id === editingSponsor.id ? newSponsor : s));
            toast({ title: 'Sponsor Updated', description: `${newSponsor.name} has been updated.` });
        } else {
            setSponsors(prev => [...prev, newSponsor]);
            toast({ title: 'Sponsor Added', description: `${newSponsor.name} has been added.` });
        }
        
        setIsFormOpen(false);
        setEditingSponsor(null);
        setLogoPreview(null);
    };

    const openEditForm = (sponsor: any) => {
        setEditingSponsor(sponsor);
        setLogoPreview(sponsor.logo);
        setIsFormOpen(true);
    };
    
    const openAddForm = () => {
        setEditingSponsor(null);
        setLogoPreview(null);
        setIsFormOpen(true);
    };
    
    const handleGenerateCertificate = (sponsorName: string) => {
        toast({
            title: 'Certificate Generated (Mock)',
            description: `A "Thank You" certificate for ${sponsorName} has been generated.`,
        });
    };
    
    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoPreview(URL.createObjectURL(file));
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Handshake className="h-8 w-8 text-green-500" />
                    <div>
                        <h1 className="text-3xl font-bold">Sponsorships &amp; Funding</h1>
                        <p className="text-muted-foreground">Track and manage sponsorships for your school's activities.</p>
                    </div>
                </div>
                <Button onClick={openAddForm}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Sponsor
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Sponsorship Tracker</CardTitle>
                    <CardDescription>An overview of all current sponsorships and their funding status.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Sponsor</TableHead>
                                <TableHead>Pledged</TableHead>
                                <TableHead>Received</TableHead>
                                <TableHead>Progress</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sponsors.map((sponsor) => (
                                <TableRow key={sponsor.id}>
                                    <TableCell className="font-medium">{sponsor.name}</TableCell>
                                    <TableCell>₹{sponsor.pledged.toLocaleString()}</TableCell>
                                    <TableCell>₹{sponsor.received.toLocaleString()}</TableCell>
                                    <TableCell>
                                        <Progress value={(sponsor.received / sponsor.pledged) * 100} className="w-full" />
                                    </TableCell>
                                    <TableCell className="text-right space-x-1">
                                        <Button variant="outline" size="sm" onClick={() => handleGenerateCertificate(sponsor.name)}>Certificate</Button>
                                        <Button variant="ghost" size="icon" onClick={() => openEditForm(sponsor)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingSponsor ? 'Edit Sponsor' : 'Add New Sponsor'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleFormSubmit}>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Sponsor Name</Label>
                                <Input id="name" name="name" defaultValue={editingSponsor?.name || ''} required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                               <div className="space-y-2">
                                    <Label htmlFor="pledged">Amount Pledged (₹)</Label>
                                    <Input id="pledged" name="pledged" type="number" defaultValue={editingSponsor?.pledged || ''} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="received">Amount Received (₹)</Label>
                                    <Input id="received" name="received" type="number" defaultValue={editingSponsor?.received || ''} required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="logo">Sponsor Logo (Mock Upload)</Label>
                                <Input id="logo" type="file" onChange={handleLogoChange} />
                                {logoPreview && (
                                    <div className="mt-2">
                                        <Image src={logoPreview} alt="Logo Preview" width={80} height={80} className="rounded-md border p-1" data-ai-hint="logo" />
                                    </div>
                                )}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                            <Button type="submit">Save</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

        </div>
    );
}
