

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MoreHorizontal, PlusCircle, Trash2, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { removeArenaOrg } from './actions';
import type { User } from '@/types';
import { StatusBadge } from '@/components/status-badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { OrganizationFormDialog } from '@/app/super-admin/organisations/client';

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

function getInitials(name: string | undefined | null) {
  if (!name) return '';
  const names = name.split(' ').filter(Boolean);
  if (names.length > 1) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }
  return names[0]?.substring(0, 2).toUpperCase() ?? '';
};

export function ArenaClientPage({ orgs, users }: { orgs: ArenaOrg[], users: User[] }) {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingOrg, setDeletingOrg] = useState<ArenaOrg | null>(null);
    const { toast } = useToast();
    const router = useRouter();

    const onActionFinish = () => {
        router.refresh();
        setIsAddDialogOpen(false);
    };

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

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Shield className="h-8 w-8 text-gray-500" />
                    <div>
                        <h1 className="text-2xl font-bold">Arenas</h1>
                        <p className="text-muted-foreground">Manage Arena-type organizations.</p>
                    </div>
                </div>
                <Button onClick={() => setIsAddDialogOpen(true)} className="h-8 text-xs">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Arena
                </Button>
            </div>
            <Card>
                <CardContent className="pt-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Arena</TableHead>
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
                                        No Arena-type organizations found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <OrganizationFormDialog 
                isOpen={isAddDialogOpen} 
                setIsOpen={setIsAddDialogOpen}
                org={null} // Always for adding new
                users={users}
                onFinished={onActionFinish}
                orgType={4} // Arena org type
                dialogTitle="Add New Arena"
                dialogDescription="Create a new Arena organization and assign an owner."
            />

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>This will remove the Arena organization. This action cannot be undone.</AlertDialogDescription>
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
