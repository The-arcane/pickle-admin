
'use client';

import { useState, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { inviteResidents, removeResidence } from './actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StatusBadge } from '@/components/status-badge';
import { Trash2, Send, PlusCircle, FileUp, Download } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';

type Residence = {
    id: number;
    status: string;
    invited_at: string | null;
    joined_at: string | null;
    "Name": string | null;
    email: string | null;
    phone: number | null;
    user: {
        profile_image_url: string | null;
    } | null;
};

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? 'Sending...' : <><Send className="mr-2 h-4 w-4" /> Send Invitations</>}
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


export function ResidencesClientPage({ 
    initialResidences, 
    organisationId,
    loading,
    onActionFinish
}: { 
    initialResidences: Residence[], 
    organisationId: number | null,
    loading: boolean,
    onActionFinish?: () => void;
}) {
    const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingResidenceId, setDeletingResidenceId] = useState<number | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const { toast } = useToast();
    const formRef = useRef<HTMLFormElement>(null);
    const router = useRouter();

    const handleInviteFormAction = async (formData: FormData) => {
        if (!organisationId) {
            toast({ variant: 'destructive', title: 'Error', description: 'No organization selected.' });
            return;
        }
        formData.append('organisation_id', organisationId.toString());

        const result = await inviteResidents(formData);
        if (result.error) {
            toast({ variant: "destructive", title: "Error", description: result.error });
        } else {
            toast({ title: "Success", description: result.message });
            setIsInviteDialogOpen(false);
            formRef.current?.reset();
            setSelectedFile(null);
            if (onActionFinish) {
                onActionFinish();
            } else {
                router.refresh();
            }
        }
    }
    
    const openDeleteDialog = (residenceId: number) => {
        setDeletingResidenceId(residenceId);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteAction = async () => {
        if (!deletingResidenceId) return;

        const formData = new FormData();
        formData.append('id', deletingResidenceId.toString());
        
        const result = await removeResidence(formData);
        if (result.error) {
            toast({ variant: "destructive", title: "Error", description: result.error });
        } else {
            toast({ title: "Success", description: result.message });
            if (onActionFinish) {
                onActionFinish();
            } else {
                router.refresh();
            }
        }
        setIsDeleteDialogOpen(false);
    }
    
    const handleDownloadTemplate = () => {
        const csvContent = "data:text/csv;charset=utf-8," + "Name,email,phone\n";
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "residence_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <CardTitle>Resident List</CardTitle>
                            <CardDescription>A list of all invited and joined residents.</CardDescription>
                        </div>
                         <Button onClick={() => setIsInviteDialogOpen(true)} disabled={!organisationId || loading} className="w-full sm:w-auto">
                            <PlusCircle className="mr-2 h-4 w-4" /> Invite Residents
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead className="hidden sm:table-cell">Status</TableHead>
                                <TableHead className="hidden md:table-cell">Phone</TableHead>
                                <TableHead className="hidden md:table-cell">Joined At</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={`skel-${i}`}>
                                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                        <TableCell className="hidden sm:table-cell"><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                                        <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                                        <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : initialResidences.length > 0 ? (
                                initialResidences.map((res) => (
                                    <TableRow key={res.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={res.user?.profile_image_url ?? undefined} alt={res.Name ?? ''} />
                                                    <AvatarFallback>{getInitials(res.Name)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{res.Name}</p>
                                                    <p className="text-sm text-muted-foreground truncate max-w-[150px]">{res.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell"><StatusBadge status={res.status} /></TableCell>
                                        <TableCell className="hidden md:table-cell">{res.phone ?? 'N/A'}</TableCell>
                                        <TableCell className="hidden md:table-cell">{res.joined_at ? format(new Date(res.joined_at), 'PP') : 'N/A'}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(res.id)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                                <span className="sr-only">Remove</span>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24">
                                        No residents found. Invite some to get started!
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isInviteDialogOpen} onOpenChange={(isOpen) => {
                setIsInviteDialogOpen(isOpen);
                if (!isOpen) {
                    setSelectedFile(null);
                }
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Invite New Residents via CSV</DialogTitle>
                        <DialogDescription>
                            Upload a CSV file with 'Name', 'email', and 'phone' columns. New users will be created if they don't exist.
                        </DialogDescription>
                    </DialogHeader>
                    <form ref={formRef} action={handleInviteFormAction} className="space-y-4 py-4">
                        <div className="space-y-2">
                             <Label htmlFor="csv_file" className="sr-only">CSV File</Label>
                             <Input
                                id="csv_file"
                                name="csv_file"
                                type="file"
                                accept=".csv"
                                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                required
                                className="hidden"
                            />
                            <Button type="button" variant="outline" className="w-full" onClick={() => document.getElementById('csv_file')?.click()}>
                                <FileUp className="mr-2 h-4 w-4" />
                                {selectedFile ? selectedFile.name : "Select a CSV file"}
                            </Button>
                             <Button
                                type="button"
                                variant="link"
                                size="sm"
                                className="h-auto p-0 justify-start"
                                onClick={handleDownloadTemplate}
                            >
                                <Download className="mr-2 h-3 w-3" />
                                Download CSV Template
                            </Button>
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
                        <AlertDialogDescription>This will remove the resident from this organization. This action cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAction} className="bg-destructive hover:bg-destructive/90">Remove</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
