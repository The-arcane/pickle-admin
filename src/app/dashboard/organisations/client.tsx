
'use client';
import { useState, useRef } from 'react';
import { Building, Home, PlusCircle, Trash2, Milestone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { updateOrganization, addBuilding, addBuildingNumber, addFlat, deleteBuilding, deleteBuildingNumber, deleteFlat } from './actions';
import { useToast } from '@/hooks/use-toast';
import { useFormStatus } from 'react-dom';
import { Textarea } from '@/components/ui/textarea';

type Organisation = {
    id: number;
    name: string;
    address: string | null;
    logo: string | null;
}

type Flat = {
    id: number;
    flat_number: string;
}

type BuildingNumber = {
    id: number;
    number: string;
    flats: Flat[];
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

export function OrganisationClientPage({ organisation, initialBuildings }: { organisation: Organisation, initialBuildings: Building[] }) {
    const { toast } = useToast();
    const [isBuildingDialogOpen, setIsBuildingDialogOpen] = useState(false);
    const [isBuildingNumberDialogOpen, setIsBuildingNumberDialogOpen] = useState(false);
    const [isFlatDialogOpen, setIsFlatDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    
    const [itemToDelete, setItemToDelete] = useState<{ type: 'building' | 'building_number' | 'flat', id: number } | null>(null);
    const [selectedBuildingId, setSelectedBuildingId] = useState<number | null>(null);
    const [selectedBuildingNumberId, setSelectedBuildingNumberId] = useState<number | null>(null);
    
    const buildingFormRef = useRef<HTMLFormElement>(null);
    const buildingNumberFormRef = useRef<HTMLFormElement>(null);
    const flatFormRef = useRef<HTMLFormElement>(null);

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
        if (!itemToDelete) return;

        let action;
        switch (itemToDelete.type) {
            case 'building': action = deleteBuilding; break;
            case 'building_number': action = deleteBuildingNumber; break;
            case 'flat': action = deleteFlat; break;
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
                        <h1 className="text-3xl font-bold">Living Space Profile</h1>
                        <p className="text-muted-foreground">Manage your Living Space's public information and structure.</p>
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
                                <Label htmlFor="name">Living Space Name</Label>
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
                                <CardDescription>Manage the structure of your Living Space.</CardDescription>
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
                                    <div className="flex items-center justify-between w-full group">
                                        <AccordionTrigger className="flex-1 hover:no-underline pr-4">
                                            <div className="flex items-center gap-2">
                                                <Building className="h-5 w-5 text-muted-foreground" />
                                                <span className="font-semibold">{building.name}</span>
                                            </div>
                                        </AccordionTrigger>
                                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10" onClick={() => {
                                            setItemToDelete({ type: 'building', id: building.id });
                                            setIsDeleteDialogOpen(true);
                                        }}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                    <AccordionContent>
                                        <div className="pl-4 border-l-2 ml-2 space-y-2">
                                            {building.building_numbers.map(bldgNumber => (
                                                <Accordion key={bldgNumber.id} type="multiple" className="w-full">
                                                    <AccordionItem value={`bldg-num-${bldgNumber.id}`}>
                                                         <div className="flex items-center justify-between w-full group">
                                                            <AccordionTrigger className="flex-1 hover:no-underline text-sm p-2 rounded-md hover:bg-muted pr-2">
                                                                <div className="flex items-center gap-2">
                                                                    <Milestone className="h-4 w-4 text-muted-foreground" />
                                                                    <span>Wing / Block: {bldgNumber.number}</span>
                                                                </div>
                                                            </AccordionTrigger>
                                                            <Button type="button" variant="ghost" size="icon" className="h-7 w-7 hover:bg-destructive/10" onClick={() => {
                                                                setItemToDelete({ type: 'building_number', id: bldgNumber.id });
                                                                setIsDeleteDialogOpen(true);
                                                            }}>
                                                                <Trash2 className="h-3 w-3 text-destructive" />
                                                            </Button>
                                                        </div>
                                                        <AccordionContent>
                                                            <div className="pl-4 border-l-2 ml-2 space-y-2 mt-2">
                                                                {bldgNumber.flats.map(flat => (
                                                                    <div key={flat.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                                                                        <div className="flex items-center gap-2">
                                                                            <Home className="h-4 w-4 text-muted-foreground" />
                                                                            <span>Flat {flat.flat_number}</span>
                                                                        </div>
                                                                        <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
                                                                            setItemToDelete({ type: 'flat', id: flat.id });
                                                                            setIsDeleteDialogOpen(true);
                                                                        }}>
                                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                                        </Button>
                                                                    </div>
                                                                ))}
                                                                {bldgNumber.flats.length === 0 && <p className="text-xs text-muted-foreground p-2">No flats added yet.</p>}
                                                                <Button variant="outline" size="sm" className="mt-2 h-8" onClick={() => {
                                                                    setSelectedBuildingNumberId(bldgNumber.id);
                                                                    setIsFlatDialogOpen(true);
                                                                }}>
                                                                    <PlusCircle className="mr-2 h-3 w-3" /> Add Flat
                                                                </Button>
                                                            </div>
                                                        </AccordionContent>
                                                    </AccordionItem>
                                                </Accordion>
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

            {/* Add Flat Dialog */}
             <Dialog open={isFlatDialogOpen} onOpenChange={setIsFlatDialogOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Add New Flat</DialogTitle></DialogHeader>
                    <form ref={flatFormRef} action={(fd) => handleFormAction(addFlat, fd, setIsFlatDialogOpen, flatFormRef)} className="space-y-4">
                        <input type="hidden" name="building_number_id" value={selectedBuildingNumberId || ''} />
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

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the {itemToDelete?.type.replace('_', ' ')} and all its contents (e.g., deleting a building deletes all its wings and flats). This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAction} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
