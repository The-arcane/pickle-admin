
'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useFormStatus } from 'react-dom';
import { saveWebsiteTextDetails, saveWebsiteImage } from './actions';
import type { Organization, OrganisationWebsite } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Globe, Upload } from 'lucide-react';

function TextSubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
            {pending ? 'Saving Content...' : 'Save Content Changes'}
        </Button>
    )
}

function ImageSubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" size="sm" variant="secondary" disabled={pending} className="w-full sm:w-auto">
             {pending ? 'Uploading...' : <><Upload className="mr-2 h-4 w-4" /> Upload</>}
        </Button>
    )
}

function ImageUploadForm({ orgId, imageType, currentImageUrl, label }: { orgId: number, imageType: 'logo' | 'bg_image' | 'vis_image' | 'mis_image', currentImageUrl?: string | null, label: string }) {
    const { toast } = useToast();
    const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
    const inputFileRef = useRef<HTMLInputElement>(null);

    async function handleFormAction(formData: FormData) {
        const result = await saveWebsiteImage(formData);
        if (result.error) {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        } else {
            toast({ title: 'Success', description: result.message });
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                toast({
                    variant: 'destructive',
                    title: 'File Too Large',
                    description: `The ${label} image cannot exceed 2MB.`,
                });
                if(inputFileRef.current) inputFileRef.current.value = '';
                return;
            }
            setPreview(URL.createObjectURL(file));
        }
    };

    return (
        <form action={handleFormAction} className="space-y-4 p-4 border rounded-lg">
            <input type="hidden" name="org_id" value={orgId} />
            <input type="hidden" name="image_type" value={imageType} />
            <div className="space-y-2">
                <Label htmlFor={imageType}>{label} (Max 2MB)</Label>
                <div className="flex flex-col sm:flex-row items-stretch gap-2">
                     <Input ref={inputFileRef} id={imageType} name="image_file" type="file" accept="image/*" onChange={handleFileChange} className="flex-grow" />
                     <ImageSubmitButton />
                </div>
            </div>
            {preview && <Image src={preview} alt={`${label} preview`} width={160} height={90} className="mt-2 rounded-md object-cover" data-ai-hint="placeholder" />}
        </form>
    );
}


export function EditWebsiteClientPage({ organization, websiteDetails }: { organization: Organization, websiteDetails: OrganisationWebsite | null }) {
    const { toast } = useToast();

    async function handleTextFormAction(formData: FormData) {
        const result = await saveWebsiteTextDetails(formData);
        if (result.error) {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        } else {
            toast({ title: 'Success', description: result.message });
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Globe className="h-8 w-8 text-primary" />
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold">Edit Public Page</h1>
                        <p className="text-muted-foreground">Manage content for the public page of <span className="font-semibold">{organization.name}</span>.</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button variant="outline" type="button" asChild className="flex-1 sm:flex-initial"><Link href="/super-admin/organisations">Back</Link></Button>
                </div>
            </div>

            <Card>
                 <CardHeader>
                    <CardTitle>Page Content</CardTitle>
                    <CardDescription>Enter the text content for the page sections. Click "Save Content Changes" when you are done.</CardDescription>
                </CardHeader>
                <form action={handleTextFormAction}>
                     <CardContent className="space-y-6">
                        <input type="hidden" name="org_id" value={organization.id} />
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
                    <CardContent>
                        <TextSubmitButton />
                    </CardContent>
                </form>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle>Page Images</CardTitle>
                    <CardDescription>Upload images for each section individually. Each upload will save automatically.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <ImageUploadForm orgId={organization.id} imageType="logo" currentImageUrl={websiteDetails?.logo} label="Logo" />
                   <ImageUploadForm orgId={organization.id} imageType="bg_image" currentImageUrl={websiteDetails?.bg_image} label="Background Image" />
                   <ImageUploadForm orgId={organization.id} imageType="vis_image" currentImageUrl={websiteDetails?.vis_image} label="Vision Image" />
                   <ImageUploadForm orgId={organization.id} imageType="mis_image" currentImageUrl={websiteDetails?.mis_image} label="Mission Image" />
                </CardContent>
            </Card>
        </div>
    )
}
