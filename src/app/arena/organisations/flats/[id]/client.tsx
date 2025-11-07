
'use client';
import { useState, useRef } from 'react';
import Link from 'next/link';
import { Home, PlusCircle, Trash2, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { addFlat, deleteFlat } from '@/app/livingspace/organisations/actions';
import { useToast } from '@/hooks/use-toast';
import { useFormStatus } from 'react-dom';
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from '@/components/ui/table';

type Flat = {
    id: number;
    flat_number: string;
};

type BuildingInfo = {
    buildingName: string;
    wingNumber: string;
}

function SubmitButton({ children }: { children: React.ReactNode }) {
    const { pending } = useFormStatus();
    return <Button type="submit" disabled={pending}>{pending ? 'Saving...' : children}</Button>
}

export function FlatsClientPage({ buildingNumberId, initialFlats, buildingInfo }: { buildingNumberId: number, initialFlats: Flat[], buildingInfo: BuildingInfo }) {
    const { toast } = useToast();
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<Flat | null>(null);
    const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
    const formRef = useRef<HTMLFormElement>(null);

    const handleFormAction = async (action: (formData: FormData) => Promise<{ error?: string, success?: boolean, message?: string }>, formData: FormData, dialogSetter?: (open: boolean) => void, formRef?: React.RefObject<HTMLFormElement>) => {
        const result = await action(formData);
        if (result.error) {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        } else {
            if (result.message) toast({ title: 'Success', description: result.message });
            if (dialogSetter) dialogSetter(false);
            if (formRef?.current) formRef.current.reset();
        }
    };
    
    const handleDeleteAction = async () => {
        if (!itemToDelete || deleteConfirmationText !== 'DELETE') return;

        const formData = new FormData();
        formData.append('id', itemToDelete.id.toString());
        formData.append('building_number_id', buildingNumberId.toString());

        const result = await deleteFlat(formData);
        if (result.error) {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        } else {
            toast({ title: 'Success', description: result.message });
        }
        setIsDeleteDialogOpen(false);
        setItemToDelete(null);
    };

    return (
        <>
            <div className="space-y-6">
                 <div className="flex items-start gap-4">
                     <Button variant="outline" size="icon" className="flex-shrink-0" asChild>
                        <Link href="/arena/organisations"><ChevronLeft className="h-4 w-4" /></Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Manage Flats</h1>
                        <p className="text-muted-foreground">
                            {buildingInfo.buildingName} - Wing/Block: {buildingInfo.wingNumber}
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Flats</CardTitle>
                            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Flat</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader><DialogTitle>Add New Flat</DialogTitle></DialogHeader>
                                    <form ref={formRef} action={(fd) => handleFormAction(addFlat, fd, setIsAddDialogOpen, formRef)} className="space-y-4">
                                        <input type="hidden" name="building_number_id" value={buildingNumberId} />
                                        <div className="space-y-2">
                                            <Label htmlFor="flat_number">Flat Number</Label>
                                            <Input id="flat_number" name="flat_number" placeholder="e.g., 101, G-02" required/>
                                        </div>
                                        <DialogFooter>
                                            <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                                            <SubmitButton>Add Flat</SubmitButton>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Flat Number</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {initialFlats.map(flat => (
                                    <TableRow key={flat.id}>
                                        <TableCell className="font-medium">{flat.flat_number}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => {
                                                setItemToDelete(flat);
                                                setIsDeleteDialogOpen(true);
                                            }}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {initialFlats.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={2} className="text-center h-24">
                                            No flats added to this wing/block yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={(open) => {
                if(!open) setDeleteConfirmationText('');
                setIsDeleteDialogOpen(open);
            }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                           This will permanently delete Flat <span className="font-bold">{itemToDelete?.flat_number}</span>. This action cannot be undone.
                        </AlertDialogDescription>
                        <div className="space-y-2 pt-2">
                            <Label htmlFor="delete-confirm">To confirm, type <span className="font-bold text-destructive">DELETE</span> below:</Label>
                            <Input 
                                id="delete-confirm" 
                                value={deleteConfirmationText}
                                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                            />
                        </div>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeleteConfirmationText('')}>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleDeleteAction} 
                            disabled={deleteConfirmationText !== 'DELETE'}
                            className="bg-destructive hover:bg-destructive/90">
                                Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
