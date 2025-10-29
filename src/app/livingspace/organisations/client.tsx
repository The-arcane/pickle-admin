
'use client';
import { useState, useRef } from 'react';
import { Building, Home, PlusCircle, Trash2, Milestone, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { updateOrganization, addBuilding, addBuildingNumber, deleteBuilding, deleteBuildingNumber } from './actions';
import { useToast } from '@/hooks/use-toast';
import { useFormStatus } from 'react-dom';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';

type Organisation = {
    id: number;
    name: string;
    address: string | null;
    logo: string | null;
}

type BuildingNumber = {
    id: number;
    number: string;
}

type Building = {
    id: number;
    name: string;
    building_numbers: BuildingNumber[];
}

function SubmitButton({ children }: { children: React.ReactNode }) {
    const { pending } = useFormStatus();
    return <Button type="submit" disabled={pending}>{pending ? 'Saving...' : children}</Button>
}

export function OrganisationClientPage({ 
    organisation, 
    initialBuildings,
    orgTypeName = "Living Space",
    orgTypePluralName = "Living Spaces" 
}: { 
    organisation: Organisation, 
    initialBuildings: Building[],
    orgTypeName?: string,
    orgTypePluralName?: string
}) {
    const { toast } = useToast();
    const [isBuildingDialogOpen, setIsBuildingDialogOpen] = useState(false);
    const [isBuildingNumberDialogOpen, setIsBuildingNumberDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    
    const [itemToDelete, setItemToDelete] = useState<{ type: 'building' | 'building_number' , id: number, name: string } | null>(null);
    const [selectedBuildingId, setSelectedBuildingId] = useState<number | null>(null);
    const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
    
    const buildingFormRef = useRef<HTMLFormElement>(null);
    const buildingNumberFormRef = useRef<HTMLFormElement>(null);

    const handleFormAction = async (action: (formData: FormData) => Promise<{ error?: string, success?: boolean, message?: string }>, formData: FormData, dialogSetter?: (open: boolean) => void, formRef?: React.RefObject<HTMLFormElement>) => {
        const result = await action(formData);
        if (result.error) {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        } else {
            if (result.message) toast({ title: 'Success', description: result.message });
            if (dialogSetter) dialogSetter(false);
            if (formRef?.current) formRef.current.reset();
        }
    }
    
    const handleDeleteAction = async () => {
        if (!itemToDelete || deleteConfirmationText !== 'DELETE') return;

        let action;
        switch (itemToDelete.type) {
            case 'building': action = deleteBuilding; break;
            case 'building_number': action = deleteBuildingNumber; break;
        }

        const formData = new FormData();
        formData.append('id', itemToDelete.id.toString());

        const result = await action(formData);
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
            <div className="space-y-8">
                 <div className="flex items-center gap-3">
                    <Building className="h-8 w-8 text-primary" />
                    <div>
                        <h1 className="text-3xl font-bold">{orgTypeName} Profile</h1>
                        <p className="text-muted-foreground">Manage your {orgTypeName}'s public information and structure.</p>
                    </div>
                </div>
                <form action={(fd) => handleFormAction(updateOrganization, fd)}>
                    <input type="hidden" name="id" value={organisation.id} />
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">{orgTypeName} Name</Label>
                                <Input id="name" name="name" defaultValue={organisation.name || ''} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <Textarea id="address" name="address" defaultValue={organisation.address || ''} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="logo">Logo URL</Label>
                                <Input id="logo" name="logo" defaultValue={organisation.logo || ''} />
                            </div>
                            <div className="flex justify-end">
                                <SubmitButton>Save Changes</SubmitButton>
                            </div>
                        </CardContent>
                    </Card>
                </form>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Buildings & Flats</CardTitle>
                                <CardDescription>Manage the structure of your {orgTypeName}.</CardDescription>
                            </div>
                            <Dialog open={isBuildingDialogOpen} onOpenChange={setIsBuildingDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Building</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader><DialogTitle>Add New Building</DialogTitle></DialogHeader>
                                    <form ref={buildingFormRef} action={(fd) => handleFormAction(addBuilding, fd, setIsBuildingDialogOpen, buildingFormRef)} className="space-y-4">
                                        <input type="hidden" name="organisation_id" value={organisation.id} />
                                        <div className="space-y-2">
                                            <Label htmlFor="building_name">Building Name</Label>
                                            <Input id="building_name" name="building_name" placeholder="e.g., Tower A" required/>
                                        </div>
                                        <DialogFooter>
                                            <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                                            <SubmitButton>Add Building</SubmitButton>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Accordion type="multiple" className="w-full">
                            {initialBuildings.map(building => (
                                <AccordionItem key={building.id} value={`building-${building.id}`}>
                                    <div className="flex items-center w-full group pr-4">
                                        <AccordionTrigger className="flex-1 hover:no-underline">
                                            <div className="flex items-center gap-2">
                                                <Building className="h-5 w-5 text-muted-foreground" />
                                                <span className="font-semibold">{building.name}</span>
                                            </div>
                                        </AccordionTrigger>
                                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10" onClick={() => {
                                            setItemToDelete({ type: 'building', id: building.id, name: building.name });
                                            setIsDeleteDialogOpen(true);
                                        }}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                    <AccordionContent>
                                        <div className="pl-4 border-l-2 ml-2 space-y-2">
                                            {building.building_numbers.map(bldgNumber => (
                                                <div key={bldgNumber.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                                                    <div className="flex items-center gap-2">
                                                        <Milestone className="h-4 w-4 text-muted-foreground" />
                                                        <span>Wing / Block: {bldgNumber.number}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Button asChild variant="secondary" size="sm">
                                                            <Link href={`/livingspace/organisations/flats/${bldgNumber.id}`}>
                                                                Manage Flats <ChevronsRight className="ml-2 h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                        <Button type="button" variant="ghost" size="icon" className="h-7 w-7 hover:bg-destructive/10" onClick={() => {
                                                            setItemToDelete({ type: 'building_number', id: bldgNumber.id, name: `Wing ${bldgNumber.number}` });
                                                            setIsDeleteDialogOpen(true);
                                                        }}>
                                                            <Trash2 className="h-3 w-3 text-destructive" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                            {building.building_numbers.length === 0 && <p className="text-sm text-muted-foreground p-2">No wings/blocks added yet.</p>}
                                            <Button variant="outline" size="sm" className="mt-2" onClick={() => {
                                                setSelectedBuildingId(building.id);
                                                setIsBuildingNumberDialogOpen(true);
                                            }}>
                                                <PlusCircle className="mr-2 h-4 w-4" /> Add Wing/Block
                                            </Button>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                            {initialBuildings.length === 0 && <p className="text-center text-muted-foreground py-8">No buildings added yet.</p>}
                        </Accordion>
                    </CardContent>
                </Card>
            </div>

            {/* Add Building Number Dialog */}
            <Dialog open={isBuildingNumberDialogOpen} onOpenChange={setIsBuildingNumberDialogOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Add New Wing/Block</DialogTitle></DialogHeader>
                    <form ref={buildingNumberFormRef} action={(fd) => handleFormAction(addBuildingNumber, fd, setIsBuildingNumberDialogOpen, buildingNumberFormRef)} className="space-y-4">
                        <input type="hidden" name="building_id" value={selectedBuildingId || ''} />
                        <div className="space-y-2">
                            <Label htmlFor="building_wing_number">Wing/Block Number</Label>
                            <Input id="building_wing_number" name="building_wing_number" placeholder="e.g., A, B1" required/>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                            <SubmitButton>Add Wing/Block</SubmitButton>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={(open) => {
                if(!open) setDeleteConfirmationText('');
                setIsDeleteDialogOpen(open);
            }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the {itemToDelete?.type.replace('_', ' ')} <span className="font-bold">{itemToDelete?.name}</span> and all its contents. This action cannot be undone.
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
