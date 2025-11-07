
'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { addPackage, updatePackage, deletePackage } from './actions';
import type { Package } from './types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

export function PackagesClientPage({ packages }: { packages: Package[] }) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
    const { toast } = useToast();
    const formRef = useRef<HTMLFormElement>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const openFormDialog = (pkg: Package | null) => {
        setSelectedPackage(pkg);
        setImagePreview(pkg?.image_url || null);
        setIsFormOpen(true);
    };

    const openDeleteDialog = (pkg: Package) => {
        setSelectedPackage(pkg);
        setIsDeleteOpen(true);
    };

    async function handleFormAction(formData: FormData) {
        const action = selectedPackage ? updatePackage : addPackage;
        const result = await action(formData);

        if(result.error) {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        } else {
            toast({ title: 'Success', description: `Package ${selectedPackage ? 'updated' : 'added'} successfully.` });
            setIsFormOpen(false);
        }
    }

    async function handleDeleteAction() {
        if(!selectedPackage) return;
        
        const formData = new FormData();
        formData.append('id', selectedPackage.id.toString());
        const result = await deletePackage(formData);

        if (result.error) {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        } else {
            toast({ title: 'Success', description: 'Package deleted successfully.' });
            setIsDeleteOpen(false);
        }
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImagePreview(URL.createObjectURL(file));
        }
    };

    return (
        <>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Packages</h1>
                    <p className="text-muted-foreground">Manage your organization's special packages.</p>
                </div>
                <Button onClick={() => openFormDialog(null)} className="h-8 text-xs"><PlusCircle className="mr-2 h-4 w-4"/> Add Package</Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {packages.map(pkg => (
                    <Card key={pkg.id} className="flex flex-col">
                        {pkg.image_url && <Image src={pkg.image_url} alt={pkg.title} width={400} height={250} className="w-full h-48 object-cover rounded-t-lg" data-ai-hint="package deal" />}
                        <CardHeader>
                            <CardTitle>{pkg.title}</CardTitle>
                            <CardDescription>{pkg.price_text || `₹${pkg.price_value}`}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-3">
                            <p className="text-sm text-muted-foreground">{pkg.description}</p>
                            {pkg.features && pkg.features.length > 0 && (
                                <ul className="list-disc list-inside text-sm space-y-1">
                                    {pkg.features.map((feature, i) => <li key={i}>{feature}</li>)}
                                </ul>
                            )}
                        </CardContent>
                         <CardContent className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => openFormDialog(pkg)}><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(pkg)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </CardContent>
                    </Card>
                ))}
                 {packages.length === 0 && (
                    <p className="col-span-full text-center text-muted-foreground py-10">No packages created yet.</p>
                )}
            </div>
            
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{selectedPackage ? 'Edit Package' : 'Add New Package'}</DialogTitle>
                    </DialogHeader>
                    <form ref={formRef} action={handleFormAction} className="space-y-4">
                        {selectedPackage && <input type="hidden" name="id" value={selectedPackage.id} />}
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input id="title" name="title" defaultValue={selectedPackage?.title} required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="price_text">Price Text</Label>
                                <Input id="price_text" name="price_text" defaultValue={selectedPackage?.price_text ?? ''} placeholder="e.g., Starting from..." />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="price_value">Price Value (₹)</Label>
                                <Input id="price_value" name="price_value" type="number" step="0.01" defaultValue={selectedPackage?.price_value?.toString()} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" name="description" defaultValue={selectedPackage?.description ?? ''} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="features">Features (comma-separated)</Label>
                            <Textarea id="features" name="features" defaultValue={selectedPackage?.features?.join(', ') ?? ''} placeholder="e.g., Feature 1, Feature 2" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="image_file">Package Image (Max 2MB)</Label>
                            <Input id="image_file" name="image_file" type="file" accept="image/*" onChange={handleImageChange} />
                            {imagePreview && <Image src={imagePreview} alt="Image Preview" width={200} height={125} className="mt-2 rounded-md object-cover" />}
                        </div>
                         <div className="flex items-center space-x-2">
                            <Switch id="is_active" name="is_active" defaultChecked={selectedPackage?.is_active ?? true}/>
                            <Label htmlFor="is_active">Active</Label>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                            <Button type="submit">Save Package</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

             <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>This will permanently delete the package. This action cannot be undone.</AlertDialogDescription>
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
