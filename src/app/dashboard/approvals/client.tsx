
'use client';

import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { approveRequest, rejectRequest } from './actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check, UserCheck, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type Approval = {
    id: number;
    user_id: number;
    organisation_id: number;
    created_at: string;
    user: {
        name: string | null;
        email: string | null;
        profile_image_url: string | null;
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


export function ApprovalsClientPage({ approvals }: { approvals: Approval[] }) {
    const { toast } = useToast();
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null);
    const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

    const openConfirmation = (approval: Approval, type: 'approve' | 'reject') => {
        setSelectedApproval(approval);
        setActionType(type);
        setIsAlertOpen(true);
    }
    
    const handleAction = async () => {
        if (!selectedApproval || !actionType) return;

        const formData = new FormData();
        formData.append('approval_id', selectedApproval.id.toString());
        formData.append('user_id', selectedApproval.user_id.toString());
        formData.append('organisation_id', selectedApproval.organisation_id.toString());

        const action = actionType === 'approve' ? approveRequest : rejectRequest;
        const result = await action(formData);

        if (result.error) {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        } else {
            toast({ title: 'Success', description: result.message });
        }

        setIsAlertOpen(false);
        setSelectedApproval(null);
        setActionType(null);
    }

    return (
        <>
            <div className="flex items-center gap-3">
                <UserCheck className="h-8 w-8 text-cyan-500" />
                <div>
                    <h1 className="text-3xl font-bold">Pending Approvals</h1>
                    <p className="text-muted-foreground">Approve or reject requests from users to join your organization.</p>
                </div>
            </div>
            <Card>
                <CardContent className="pt-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Request Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {approvals.length > 0 ? (
                                approvals.map((approval) => (
                                    <TableRow key={approval.id}>
                                        <TableCell>
                                             <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={approval.user?.profile_image_url ?? undefined} alt={approval.user?.name ?? ''} />
                                                    <AvatarFallback>{getInitials(approval.user?.name)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{approval.user?.name}</p>
                                                    <p className="text-sm text-muted-foreground">{approval.user?.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{formatDistanceToNow(new Date(approval.created_at), { addSuffix: true })}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button size="sm" variant="outline" onClick={() => openConfirmation(approval, 'reject')}>
                                                    <X className="mr-2 h-4 w-4" /> Reject
                                                </Button>
                                                <Button size="sm" onClick={() => openConfirmation(approval, 'approve')}>
                                                    <Check className="mr-2 h-4 w-4" /> Approve
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center h-24">
                                        No pending approvals.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            You are about to {actionType} the request for <span className="font-semibold">{selectedApproval?.user?.name}</span>.
                            {actionType === 'reject' && " This action cannot be undone."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleAction} 
                          className={actionType === 'reject' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
                        >
                            {actionType === 'approve' ? 'Approve' : 'Reject'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
