
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
import { updateOrganization, addBuilding, addBuildingNumber, deleteBuilding, deleteBuildingNumber } from '@/app/livingspace/organisations/actions';
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
    
    const handleFormAction = async (action: (formData: FormData) => Promise<{ error?: string, success?: boolean, message?: string }>, formData: FormData) => {
        const result = await action(formData);
        if (result.error) {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        } else {
            if (result.message) toast({ title: 'Success', description: result.message });
        }
    }

    return (
        <div className="space-y-8">
             <div className="flex items-center gap-3">
                <Building className="h-8 w-8 text-primary" />
                <div>
                    <h1 className="text-2xl font-bold">{orgTypeName} Profile</h1>
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
        </div>
    );
}
