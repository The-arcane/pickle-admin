
'use client';

import { useState, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { useToast } from "@/hooks/use-toast";
import { addArenaOrg, removeArenaOrg } from './actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StatusBadge } from '@/components/status-badge';
import { MoreHorizontal, Shield, PlusCircle, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Image from 'next/image';

type ArenaOrg = {
    id: number;
    name: string | null;
    address: string | null;
    logo: string | null;
    is_active: boolean;
    user: {
        name: string | null;
        email: string | null;
    } | null;
};

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? 'Creating...' : 'Create Org & Admin'}
        </Button>
    )
}

function getInitials(name: string | undefined | null) {
  if (!name) return '';
  const names = name.split(' ').filter(Boolean);
  if (names.length > 1) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }
  return names[0]?.substring(0, 2).toUpperCase() ?? '';
};


export function ArenaClientPage({ orgs }: { orgs: ArenaOrg[] }) {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingOrg, setDeletingOrg] = useState<ArenaOrg | null>(null);
    const { toast } = useToast();
    const router = useRouter();
    const formRef = useRef<HTMLFormElement>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    const handleAddFormAction = async (formData: FormData) => {
        if (formData.get('admin_password') !== formData.get('confirm_password')) {
            toast({ variant: "destructive", title: "Error", description: "Passwords do not match." });
            return;
        }

        const result = await addArenaOrg(formData);
        if (result.error) {
            toast({ variant: "destructive", title: "Error", description: result.error });
        } else {
            toast({ title: "Success", description: result.message });
            setIsAddDialogOpen(false);
            formRef.current?.reset();
            setLogoPreview(null);
            router.refresh();
        }
    }
    
    const openDeleteDialog = (org: ArenaOrg) => {
        setDeletingOrg(org);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteAction = async () => {
        if (!deletingOrg) return;

        const formData = new FormData();
        formData.append('org_id', deletingOrg.id.toString());
        
        const result = await removeArenaOrg(formData);
        if (result.error) {
            toast({ variant: "destructive", title: "Error", description: result.error });
        } else {
            toast({ title: "Success", description: result.message });
        }
        setIsDeleteDialogOpen(false);
        router.refresh();
    }

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
             if (file.size > 2 * 1024 * 1024) { // 2MB limit
                toast({
                    variant: 'destructive',
                    title: 'File Too Large',
                    description: 'The logo image cannot exceed 2MB.',
                });
                e.target.value = '';
                return;
            }
            setLogoPreview(URL.createObjectURL(file));
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Shield className="h-8 w-8 text-gray-500" />
                    <div>
                        <h1 className="text-3xl font-bold">Arenas</h1>
                        <p className="text-muted-foreground">Manage Arena-type Living Spaces.</p>
                    </div>
                </div>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Arena
                </Button>
            </div>
            <Card>
                <CardContent className="pt-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Living Space</TableHead>
                                <TableHead>Admin</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orgs.length > 0 ? (
                                orgs.map((org) => (
                                    <TableRow key={org.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={org.logo ?? undefined} alt={org.name ?? ''} />
                                                    <AvatarFallback>{getInitials(org.name)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{org.name}</p>
                                                    <p className="text-sm text-muted-foreground">{org.address}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{org.user?.name ?? 'Unassigned'}</p>
                                                <p className="text-sm text-muted-foreground">{org.user?.email}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell><StatusBadge status={org.is_active ? 'Active' : 'Inactive'} /></TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem onSelect={() => openDeleteDialog(org)} className="text-destructive">
                                                        <Trash2 className="mr-2 h-4 w-4"/> Remove
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24">
                                        No Arena-type Living Spaces found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Add New Arena Org</DialogTitle>
                        <DialogDescription>
                            Create a new Arena and its primary admin user.
                        </DialogDescription>
                    </DialogHeader>
                    <form ref={formRef} action={handleAddFormAction} className="space-y-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4 p-4 border rounded-lg">
                                 <h3 className="font-semibold text-lg">Arena Details</h3>
                                <div className="space-y-2">
                                    <Label htmlFor="org_name">Name</Label>
                                    <Input id="org_name" name="org_name" required />
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="org_address">Address</Label>
                                    <Input id="org_address" name="org_address" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="logo">Logo (Max 2MB)</Label>
                                    <Input id="logo" name="logo" type="file" accept="image/*" onChange={handleLogoChange} />
                                    {logoPreview && <Image src={logoPreview} alt="Logo preview" width={80} height={80} className="mt-2 rounded-md object-cover" data-ai-hint="logo" />}
                                </div>
                            </div>
                            <div className="space-y-4 p-4 border rounded-lg">
                                <h3 className="font-semibold text-lg">Admin User Details</h3>
                                 <div className="space-y-2">
                                    <Label htmlFor="admin_name">Admin Full Name</Label>
                                    <Input id="admin_name" name="admin_name" required />
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="admin_email">Admin Email</Label>
                                    <Input id="admin_email" name="admin_email" type="email" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="admin_password">Password</Label>
                                    <Input id="admin_password" name="admin_password" type="password" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirm_password">Confirm Password</Label>
                                    <Input id="confirm_password" name="confirm_password" type="password" required />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                            <SubmitButton />
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

             <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>This will remove the Arena organization and its associated admin. This action cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAction} className="bg-destructive hover:bg-destructive/90">Remove</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
