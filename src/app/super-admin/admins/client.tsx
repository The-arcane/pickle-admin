
'use client';

import { useState, useRef, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { addAdmin, removeAdmin } from './actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StatusBadge } from '@/components/status-badge';
import { Trash2, PlusCircle, MoreHorizontal } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

type Admin = {
    id: number;
    name: string | null;
    email: string | null;
    phone: string | null;
    is_deleted: boolean;
    created_at: string;
    profile_image_url: string | null;
    organisationName: string;
};

type Organisation = {
    id: number;
    name: string;
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? 'Inviting...' : 'Send Invitation'}
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


export function AdminsClientPage({ 
    admins,
    organisations
}: { 
    admins: Admin[],
    organisations: Organisation[]
}) {
    const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingAdmin, setDeletingAdmin] = useState<Admin | null>(null);
    const { toast } = useToast();
    const formRef = useRef<HTMLFormElement>(null);
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleInviteFormAction = async (formData: FormData) => {
        const result = await addAdmin(formData);
        if (result.error) {
            toast({ variant: "destructive", title: "Error", description: result.error });
        } else {
            toast({ title: "Success", description: result.message });
            setIsInviteDialogOpen(false);
            formRef.current?.reset();
            router.refresh();
        }
    }
    
    const openDeleteDialog = (admin: Admin) => {
        setDeletingAdmin(admin);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteAction = async () => {
        if (!deletingAdmin) return;

        const formData = new FormData();
        formData.append('user_id', deletingAdmin.id.toString());
        
        const result = await removeAdmin(formData);
        if (result.error) {
            toast({ variant: "destructive", title: "Error", description: result.error });
        } else {
            toast({ title: "Success", description: result.message });
        }
        setIsDeleteDialogOpen(false);
        router.refresh();
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Admins</h1>
                    <p className="text-muted-foreground">Manage admin users across all organizations.</p>
                </div>
                <Button onClick={() => setIsInviteDialogOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Admin
                </Button>
            </div>
            <Card>
                <CardContent className="pt-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Organization</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Joined At</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {admins.length > 0 ? (
                                admins.map((admin) => (
                                    <TableRow key={admin.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={admin.profile_image_url ?? undefined} alt={admin.name ?? ''} />
                                                    <AvatarFallback>{getInitials(admin.name)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{admin.name}</p>
                                                    <p className="text-sm text-muted-foreground">{admin.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{admin.organisationName}</TableCell>
                                        <TableCell><StatusBadge status={admin.is_deleted ? 'Inactive' : 'Active'} /></TableCell>
                                        <TableCell>
                                            {isClient ? format(new Date(admin.created_at), 'PPp') : <Skeleton className="h-5 w-32" />}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem onSelect={() => openDeleteDialog(admin)} className="text-destructive">
                                                        <Trash2 className="mr-2 h-4 w-4"/> Remove
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24">
                                        No admins found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Invite New Admin</DialogTitle>
                        <DialogDescription>
                            Enter the admin's details. They will receive an invitation to join the selected organization.
                        </DialogDescription>
                    </DialogHeader>
                    <form ref={formRef} action={handleInviteFormAction} className="space-y-4 py-4">
                        <div className="space-y-2">
                             <Label htmlFor="name">Full Name</Label>
                             <Input id="name" name="name" type="text" placeholder="Jane Smith" required />
                        </div>
                        <div className="space-y-2">
                             <Label htmlFor="email">Email Address</Label>
                             <Input id="email" name="email" type="email" placeholder="admin@example.com" required />
                        </div>
                        <div className="space-y-2">
                             <Label htmlFor="phone">Phone Number</Label>
                             <Input id="phone" name="phone" type="tel" placeholder="9876543210" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="organisation_id">Organization</Label>
                            <Select name="organisation_id" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select an organization" />
                                </SelectTrigger>
                                <SelectContent>
                                    {organisations.map(org => (
                                        <SelectItem key={org.id} value={org.id.toString()}>{org.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
                        <AlertDialogDescription>This will remove the admin and revoke their access. This action cannot be undone.</AlertDialogDescription>
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
