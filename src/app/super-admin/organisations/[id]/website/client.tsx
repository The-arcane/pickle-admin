
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useFormStatus } from 'react-dom';
import { saveWebsiteDetails } from './actions';
import type { Organization, OrganisationWebsite } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Globe, ImagePlus } from 'lucide-react';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? 'Saving...' : 'Save Changes'}
        </Button>
    )
}

function ImageUploadField({ name, label, currentImageUrl, toast }: { name: string, label: string, currentImageUrl: string | null | undefined, toast: any}) {
    const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
    
    useEffect(() => {
        setPreview(currentImageUrl || null);
    }, [currentImageUrl]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                toast({
                    variant: 'destructive',
                    title: 'File Too Large',
                    description: `The ${label} image cannot exceed 2MB.`,
                });
                e.target.value = ''; // Reset the input
                return;
            }
            setPreview(URL.createObjectURL(file));
        }
    };

    return (
        <div className="space-y-2">
            <Label htmlFor={name}>{label} (Max 2MB)</Label>
            <Input id={name} name={name} type="file" accept="image/*" onChange={handleFileChange} />
            {preview && <Image src={preview} alt={`${label} preview`} width={160} height={90} className="mt-2 rounded-md object-cover" data-ai-hint="placeholder" />}
        </div>
    );
}

export function EditWebsiteClientPage({ organization, websiteDetails }: { organization: Organization, websiteDetails: OrganisationWebsite | null }) {
    const { toast } = useToast();

    async function handleFormAction(formData: FormData) {
        const result = await saveWebsiteDetails(formData);
        if (result.error) {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        } else {
            toast({ title: 'Success', description: 'Public page details saved successfully.' });
        }
    }

    return (
        <form action={handleFormAction} className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Globe className="h-8 w-8 text-primary" />
                    <div>
                        <h1 className="text-3xl font-bold">Edit Public Page</h1>
                        <p className="text-muted-foreground">Manage content for the public page of <span className="font-semibold">{organization.name}</span>.</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" type="button" asChild><Link href="/super-admin/organisations">Cancel</Link></Button>
                    <SubmitButton />
                </div>
            </div>

            <input type="hidden" name="org_id" value={organization.id} />
            {websiteDetails?.id && <input type="hidden" name="id" value={websiteDetails.id} />}

            <Card>
                <CardHeader>
                    <CardTitle>Page Content</CardTitle>
                    <CardDescription>Enter the text content for the page sections.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="about">About Section</Label>
                        <Textarea id="about" name="about" defaultValue={websiteDetails?.About || ''} placeholder="Tell visitors about this organization." rows={4} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="vision">Our Vision Section</Label>
                        <Textarea id="vision" name="vision" defaultValue={websiteDetails?.Our_vision || ''} placeholder="Describe the vision of the organization." rows={3} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="mission">Our Mission Section</Label>
                        <Textarea id="mission" name="mission" defaultValue={websiteDetails?.Our_mission || ''} placeholder="Describe the mission of the organization." rows={3} />
                    </div>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle>Page Images</CardTitle>
                    <CardDescription>Upload images for the different sections of the page.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <ImageUploadField name="logo_file" label="Logo" currentImageUrl={websiteDetails?.logo} toast={toast} />
                    <ImageUploadField name="bg_image_file" label="Background Image" currentImageUrl={websiteDetails?.bg_image} toast={toast} />
                    <ImageUploadField name="vis_image_file" label="Vision Image" currentImageUrl={websiteDetails?.vis_image} toast={toast} />
                    <ImageUploadField name="mis_image_file" label="Mission Image" currentImageUrl={websiteDetails?.mis_image} toast={toast} />
                </CardContent>
            </Card>

             <div className="flex items-center justify-end gap-2 sticky bottom-0 bg-background py-4">
                <Button variant="outline" type="button" asChild><Link href="/super-admin/organisations">Cancel</Link></Button>
                <SubmitButton />
            </div>
        </form>
    )
}
