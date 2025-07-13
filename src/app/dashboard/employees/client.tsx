
'use client';

import { useState, useRef, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { addEmployee, removeEmployee } from './actions';
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type Employee = {
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


export function EmployeesClientPage({ 
    employees, 
    organisationId
}: { 
    employees: Employee[], 
    organisationId: number
}) {
    const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);
    const { toast } = useToast();
    const formRef = useRef<HTMLFormElement>(null);
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleInviteFormAction = async (formData: FormData) => {
        formData.append('organisation_id', organisationId.toString());

        const result = await addEmployee(formData);
        if (result.error) {
            toast({ variant: "destructive", title: "Error", description: result.error });
        } else {
            toast({ title: "Success", description: result.message });
            setIsInviteDialogOpen(false);
            formRef.current?.reset();
            router.refresh();
        }
    }
    
    const openDeleteDialog = (employee: Employee) => {
        setDeletingEmployee(employee);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteAction = async () => {
        if (!deletingEmployee) return;

        const formData = new FormData();
        formData.append('user_id', deletingEmployee.id.toString());
        
        const result = await removeEmployee(formData);
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
                    <h1 className="text-3xl font-bold">Employees</h1>
                    <p className="text-muted-foreground">Manage employees for your organization.</p>
                </div>
                <Button onClick={() => setIsInviteDialogOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Employee
                </Button>
            </div>
            <Card>
                <CardContent className="pt-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Joined At</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {employees.length > 0 ? (
                                employees.map((emp) => (
                                    <TableRow key={emp.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={emp.profile_image_url ?? undefined} alt={emp.name ?? ''} />
                                                    <AvatarFallback>{getInitials(emp.name)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{emp.name}</p>
                                                    <p className="text-sm text-muted-foreground">{emp.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell><StatusBadge status={emp.is_deleted ? 'Inactive' : 'Active'} /></TableCell>
                                        <TableCell>{emp.phone ?? 'N/A'}</TableCell>
                                        <TableCell>
                                            {isClient ? format(new Date(emp.created_at), 'PPp') : <Skeleton className="h-5 w-32" />}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem onSelect={() => openDeleteDialog(emp)} className="text-destructive">
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
                                        No employees found.
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
                        <DialogTitle>Invite New Employee</DialogTitle>
                        <DialogDescription>
                            Enter the employee's details. They will receive an invitation email to set their password and join.
                        </DialogDescription>
                    </DialogHeader>
                    <form ref={formRef} action={handleInviteFormAction} className="space-y-4 py-4">
                        <div className="space-y-2">
                             <Label htmlFor="name">Full Name</Label>
                             <Input id="name" name="name" type="text" placeholder="John Doe" required />
                        </div>
                        <div className="space-y-2">
                             <Label htmlFor="email">Email Address</Label>
                             <Input id="email" name="email" type="email" placeholder="employee@example.com" required />
                        </div>
                         <div className="space-y-2">
                             <Label htmlFor="phone">Phone Number</Label>
                             <Input id="phone" name="phone" type="tel" placeholder="9876543210" />
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
                        <AlertDialogDescription>This will remove the employee from this organization. This action cannot be undone.</AlertDialogDescription>
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
