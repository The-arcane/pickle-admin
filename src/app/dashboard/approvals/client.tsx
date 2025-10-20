
'use client';

import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { approveRequest, rejectRequest, approveMultipleRequests, rejectMultipleRequests } from './actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
import { Checkbox } from '@/components/ui/checkbox';

type BuildingDetails = {
    id: number;
    number: string;
    building: {
        name: string;
    } | null;
} | null;


type Approval = {
    id: number;
    user_id: number;
    organisation_id: number;
    created_at: string;
    flat: string | null;
    building_details: BuildingDetails;
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
    const [actionType, setActionType] = useState<'approve' | 'reject' | 'bulk_approve' | 'bulk_reject' | null>(null);
    const [selectedApprovals, setSelectedApprovals] = useState<number[]>([]);

    const openConfirmation = (approval: Approval, type: 'approve' | 'reject') => {
        setSelectedApproval(approval);
        setActionType(type);
        setIsAlertOpen(true);
    }

    const openBulkConfirmation = (type: 'bulk_approve' | 'bulk_reject') => {
        setActionType(type);
        setIsAlertOpen(true);
    }
    
    const handleAction = async () => {
        if (!actionType) return;
    
        let result: { success?: boolean; message?: string; error?: string; } | undefined;
    
        if (actionType === 'approve' && selectedApproval) {
            const formData = new FormData();
            formData.append('approval_id', selectedApproval.id.toString());
            formData.append('user_id', selectedApproval.user_id.toString());
            formData.append('organisation_id', selectedApproval.organisation_id.toString());
            if (selectedApproval.building_details?.id) {
                formData.append('building_number_id', selectedApproval.building_details.id.toString());
            }
            if (selectedApproval.flat) {
                formData.append('flat', selectedApproval.flat);
            }
            result = await approveRequest(formData);
        } else if (actionType === 'reject' && selectedApproval) {
            const formData = new FormData();
            formData.append('approval_id', selectedApproval.id.toString());
            result = await rejectRequest(formData);
        } else if (actionType === 'bulk_approve') {
            const approvalsToProcess = selectedApprovals.map(id => {
                const approval = approvals.find(a => a.id === id);
                return approval ? { 
                    approvalId: approval.id, 
                    userId: approval.user_id, 
                    organisationId: approval.organisation_id,
                    buildingNumberId: approval.building_details?.id ?? null,
                    flat: approval.flat
                } : null;
            }).filter(Boolean) as { approvalId: number, userId: number, organisationId: number, buildingNumberId: number | null, flat: string | null }[];
            result = await approveMultipleRequests(approvalsToProcess);
        } else if (actionType === 'bulk_reject') {
            result = await rejectMultipleRequests(selectedApprovals);
        }
    
        if (result?.error) {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        } else if (result?.success) {
            toast({ title: 'Success', description: result.message });
            setSelectedApprovals([]); // Clear selections on success
        }
    
        setIsAlertOpen(false);
        setSelectedApproval(null);
        setActionType(null);
    };

    const handleSelectAll = (checked: boolean | 'indeterminate') => {
        if (checked === true) {
            setSelectedApprovals(approvals.map(a => a.id));
        } else {
            setSelectedApprovals([]);
        }
    };

    const handleSelectOne = (id: number, checked: boolean) => {
        setSelectedApprovals(prev =>
            checked ? [...prev, id] : prev.filter(selId => selId !== id)
        );
    };
    
    const formatFlatDetails = (approval: Approval) => {
        if (!approval.building_details && !approval.flat) return 'N/A';
        const building = approval.building_details?.building?.name ?? 'N/A';
        const wing = approval.building_details?.number ?? 'N/A';
        const flatNumber = approval.flat ?? 'N/A';
        return `${building}, Wing ${wing}, Flat ${flatNumber}`;
    };

    const isAllSelected = selectedApprovals.length > 0 && selectedApprovals.length === approvals.length;
    const isSomeSelected = selectedApprovals.length > 0 && selectedApprovals.length < approvals.length;

    return (
        <>
            <div className="flex items-center gap-3">
                <UserCheck className="h-8 w-8 text-cyan-500" />
                <div>
                    <h1 className="text-3xl font-bold">Pending Approvals</h1>
                    <p className="text-muted-foreground">Approve or reject requests from users to join your Living Space.</p>
                </div>
            </div>
            <Card>
                <CardHeader>
                    {selectedApprovals.length > 0 && (
                        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                            <span className="text-sm font-medium">{selectedApprovals.length} selected</span>
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => openBulkConfirmation('bulk_reject')}>
                                    <X className="mr-2 h-4 w-4" /> Reject Selected
                                </Button>
                                <Button size="sm" onClick={() => openBulkConfirmation('bulk_approve')}>
                                    <Check className="mr-2 h-4 w-4" /> Approve Selected
                                </Button>
                            </div>
                        </div>
                    )}
                </CardHeader>
                <CardContent className="pt-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">
                                    <Checkbox
                                        checked={isAllSelected || (isSomeSelected ? "indeterminate" : false)}
                                        onCheckedChange={handleSelectAll}
                                        aria-label="Select all"
                                    />
                                </TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Flat Details</TableHead>
                                <TableHead>Request Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {approvals.length > 0 ? (
                                approvals.map((approval) => (
                                    <TableRow key={approval.id} data-state={selectedApprovals.includes(approval.id) && "selected"}>
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedApprovals.includes(approval.id)}
                                                onCheckedChange={(checked) => handleSelectOne(approval.id, !!checked)}
                                                aria-label={`Select approval from ${approval.user?.name}`}
                                            />
                                        </TableCell>
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
                                        <TableCell>
                                            <p className="font-medium">{formatFlatDetails(approval)}</p>
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
                                    <TableCell colSpan={5} className="text-center h-24">
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
                            {actionType?.startsWith('bulk') 
                             ? `You are about to ${actionType === 'bulk_approve' ? 'approve' : 'reject'} ${selectedApprovals.length} request(s).`
                             : `You are about to ${actionType} the request for ${selectedApproval?.user?.name}.`
                            }
                            {(actionType === 'reject' || actionType === 'bulk_reject') && " This action cannot be undone."}
                            {(actionType === 'approve' || actionType === 'bulk_approve') && " This will add the user(s) to your Living Space."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleAction} 
                          className={(actionType === 'reject' || actionType === 'bulk_reject') ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
                        >
                            {actionType?.includes('approve') ? 'Approve' : 'Reject'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
