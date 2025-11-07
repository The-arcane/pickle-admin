
'use client';

import { useState, useRef, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { addSalesPerson, removeSalesPerson } from './actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StatusBadge } from '@/components/status-badge';
import { Trash2, PlusCircle, MoreHorizontal, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type SalesPerson = {
    id: number;
    name: string | null;
    email: string | null;
    phone: string | null;
    is_deleted: boolean;
    created_at: string;
    profile_image_url: string | null;
};

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? 'Creating...' : 'Create Sales User'}
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


export function SalesClientPage({ 
    salesPeople,
}: { 
    salesPeople: SalesPerson[],
}) {
    const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingUser, setDeletingUser] = useState<SalesPerson | null>(null);
    const { toast } = useToast();
    const formRef = useRef<HTMLFormElement>(null);
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleInviteFormAction = async (formData: FormData) => {
        if (formData.get('password') !== formData.get('confirm_password')) {
            toast({ variant: "destructive", title: "Error", description: "Passwords do not match." });
            return;
        }

        const result = await addSalesPerson(formData);
        if (result.error) {
            toast({ variant: "destructive", title: "Error", description: result.error });
        } else {
            toast({ title: "Success", description: result.message });
            setIsInviteDialogOpen(false);
            formRef.current?.reset();
            router.refresh();
        }
    }
    
    const openDeleteDialog = (user: SalesPerson) => {
        setDeletingUser(user);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteAction = async () => {
        if (!deletingUser) return;

        const formData = new FormData();
        formData.append('user_id', deletingUser.id.toString());
        
        const result = await removeSalesPerson(formData);
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
                <div className="flex items-center gap-3">
                    <TrendingUp className="h-8 w-8 text-green-500" />
                    <div>
                        <h1 className="text-2xl font-bold">Sales Team</h1>
                        <p className="text-muted-foreground">Manage sales people in the system.</p>
                    </div>
                </div>
                <Button onClick={() => setIsInviteDialogOpen(true)} className="h-8 text-xs">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Sales Person
                </Button>
            </div>
            <Card>
                <CardContent className="pt-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Joined At</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {salesPeople.length > 0 ? (
                                salesPeople.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={user.profile_image_url ?? undefined} alt={user.name ?? ''} />
                                                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{user.name}</p>
                                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell><StatusBadge status={user.is_deleted ? 'Inactive' : 'Active'} /></TableCell>
                                        <TableCell>
                                            {isClient ? format(new Date(user.created_at), 'PPp') : <Skeleton className="h-5 w-32" />}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem onSelect={() => openDeleteDialog(user)} className="text-destructive">
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
                                        No sales people found.
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
                        <DialogTitle>Create New Sales User</DialogTitle>
                        <DialogDescription>
                            Enter the user's details. They will be created with a Sales role.
                        </DialogDescription>
                    </DialogHeader>
                    <form ref={formRef} action={handleInviteFormAction} className="space-y-4 py-4">
                        <div className="space-y-2">
                             <Label htmlFor="name">Full Name</Label>
                             <Input id="name" name="name" type="text" placeholder="Jane Smith" required />
                        </div>
                        <div className="space-y-2">
                             <Label htmlFor="email">Email Address</Label>
                             <Input id="email" name="email" type="email" placeholder="sales@example.com" required />
                        </div>
                        <div className="space-y-2">
                             <Label htmlFor="phone">Phone Number</Label>
                             <Input id="phone" name="phone" type="tel" placeholder="9876543210" />
                        </div>
                        <div className="space-y-2">
                             <Label htmlFor="password">Password</Label>
                             <Input id="password" name="password" type="password" required />
                        </div>
                        <div className="space-y-2">
                             <Label htmlFor="confirm_password">Confirm Password</Label>
                             <Input id="confirm_password" name="confirm_password" type="password" required />
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
                        <AlertDialogDescription>This will remove the sales person and revoke their access. This action cannot be undone.</AlertDialogDescription>
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
