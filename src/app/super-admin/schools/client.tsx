
'use client';

import { useState, useRef, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { useToast } from "@/hooks/use-toast";
import { addSchool, removeSchool } from './actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StatusBadge } from '@/components/status-badge';
import { Trash2, PlusCircle, MoreHorizontal, School } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type School = {
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

type OrganisationType = {
    id: number;
    type_name: string;
};

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? 'Creating...' : 'Create School & Admin'}
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


export function SchoolsClientPage({ schools, orgTypes }: { schools: School[], orgTypes: OrganisationType[] }) {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingSchool, setDeletingSchool] = useState<School | null>(null);
    const { toast } = useToast();
    const formRef = useRef<HTMLFormElement>(null);
    const router = useRouter();

    const handleAddFormAction = async (formData: FormData) => {
        if (formData.get('admin_password') !== formData.get('confirm_password')) {
            toast({ variant: "destructive", title: "Error", description: "Passwords do not match." });
            return;
        }

        const result = await addSchool(formData);
        if (result.error) {
            toast({ variant: "destructive", title: "Error", description: result.error });
        } else {
            toast({ title: "Success", description: result.message });
            setIsAddDialogOpen(false);
            formRef.current?.reset();
            router.refresh();
        }
    }
    
    const openDeleteDialog = (school: School) => {
        setDeletingSchool(school);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteAction = async () => {
        if (!deletingSchool) return;

        const formData = new FormData();
        formData.append('org_id', deletingSchool.id.toString());
        
        const result = await removeSchool(formData);
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
                    <School className="h-8 w-8 text-blue-500" />
                    <div>
                        <h1 className="text-3xl font-bold">Schools</h1>
                        <p className="text-muted-foreground">Manage school-type organizations.</p>
                    </div>
                </div>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add School
                </Button>
            </div>
            <Card>
                <CardContent className="pt-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>School</TableHead>
                                <TableHead>Admin</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {schools.length > 0 ? (
                                schools.map((school) => (
                                    <TableRow key={school.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={school.logo ?? undefined} alt={school.name ?? ''} />
                                                    <AvatarFallback>{getInitials(school.name)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{school.name}</p>
                                                    <p className="text-sm text-muted-foreground">{school.address}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{school.user?.name}</p>
                                                <p className="text-sm text-muted-foreground">{school.user?.email}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell><StatusBadge status={school.is_active ? 'Active' : 'Inactive'} /></TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem onSelect={() => openDeleteDialog(school)} className="text-destructive">
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
                                        No schools found.
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
                        <DialogTitle>Add New School</DialogTitle>
                        <DialogDescription>
                            Create a new school organization and its primary admin user.
                        </DialogDescription>
                    </DialogHeader>
                    <form ref={formRef} action={handleAddFormAction} className="space-y-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4 p-4 border rounded-lg">
                                 <h3 className="font-semibold text-lg">School Details</h3>
                                <div className="space-y-2">
                                    <Label htmlFor="org_name">School Name</Label>
                                    <Input id="org_name" name="org_name" required />
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="org_address">Address</Label>
                                    <Input id="org_address" name="org_address" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="org_type_id">Organization Type</Label>
                                    <Select name="org_type_id" required>
                                        <SelectTrigger><SelectValue placeholder="Select type"/></SelectTrigger>
                                        <SelectContent>
                                            {orgTypes.map(type => (
                                                <SelectItem key={type.id} value={type.id.toString()}>{type.type_name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
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
                        <AlertDialogDescription>This will remove the school organization. This action cannot be undone.</AlertDialogDescription>
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
