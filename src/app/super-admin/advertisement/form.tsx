
'use client';

import { useState, useRef, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { saveAdvertisement } from './actions';
import { FileUp, CalendarIcon, X } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';


function SubmitButton({ isEditing }: { isEditing: boolean }) {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? (isEditing ? 'Saving...' : 'Creating...') : (isEditing ? 'Save Changes' : 'Create Ad')}
        </Button>
    )
}

export function AdFormDialog({ isOpen, setIsOpen, ad, adTypeId, orgId, placements, statuses, audiences, onFinished }: { 
    isOpen: boolean, 
    setIsOpen: (open: boolean) => void, 
    ad: any | null, 
    adTypeId: number,
    orgId: number | null,
    placements: any[],
    statuses: any[],
    audiences: any[],
    onFinished: () => void 
}) {
    const { toast } = useToast();
    const formRef = useRef<HTMLFormElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const isEditing = !!ad;
    
    // State for all form fields
    const [name, setName] = useState(ad?.name || '');
    const [linkUrl, setLinkUrl] = useState(ad?.link_url || '');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(ad?.image_url || null);
    const [isImageRemoved, setIsImageRemoved] = useState(false);

    const [placementId, setPlacementId] = useState(ad?.placement_id?.toString() || '');
    const [audienceId, setAudienceId] = useState(ad?.target_audience_id?.toString() || '');
    const [statusId, setStatusId] = useState(ad?.status_id?.toString() || statuses.find(s => s.status_name === 'Active')?.id.toString() || '');
    const [isGlobal, setIsGlobal] = useState(ad?.is_global || false);
    const [startDate, setStartDate] = useState<Date | undefined>(ad?.start_date ? new Date(ad.start_date) : undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(ad?.end_date ? new Date(ad.end_date) : undefined);

    useEffect(() => {
        if (ad) {
            setName(ad.name || '');
            setLinkUrl(ad.link_url || '');
            setImageFile(null);
            setImagePreview(ad.image_url || null);
            setIsImageRemoved(false);
            setPlacementId(ad.placement_id?.toString() || '');
            setAudienceId(ad.target_audience_id?.toString() || '');
            setStatusId(ad.status_id?.toString() || statuses.find(s => s.status_name === 'Active')?.id.toString() || '');
            setIsGlobal(ad.is_global || false);
            setStartDate(ad.start_date ? new Date(ad.start_date) : undefined);
            setEndDate(ad.end_date ? new Date(ad.end_date) : undefined);
        } else {
            // Reset for new ad
            setName('');
            setLinkUrl('');
            setImageFile(null);
            setImagePreview(null);
            setIsImageRemoved(false);
            setPlacementId('');
            setAudienceId('');
            setStatusId(statuses.find(s => s.status_name === 'Active')?.id.toString() || '');
            setIsGlobal(false);
            setStartDate(undefined);
            setEndDate(undefined);
        }
    }, [ad, statuses, isOpen]);

    const handleFormAction = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData();
        if (ad?.id) formData.append('id', ad.id);
        formData.append('type_id', adTypeId.toString());
        if (orgId) formData.append('organisation_id', orgId.toString());

        formData.append('name', name);
        formData.append('link_url', linkUrl);
        if (imageFile) {
            formData.append('image_file', imageFile);
        } else if (isImageRemoved) {
            // Signal to backend to remove the image URL
            formData.append('remove_image', 'true');
        }
        
        formData.append('placement_id', placementId);
        formData.append('target_audience_id', audienceId);
        formData.append('status_id', statusId);
        if(isGlobal) formData.append('is_global', 'on');
        if(startDate) formData.append('start_date', startDate.toISOString());
        if(endDate) formData.append('end_date', endDate.toISOString());

        const result = await saveAdvertisement(formData);
        if (result.error) {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        } else {
            toast({ title: 'Success', description: result.message });
            onFinished();
        }
    }
    
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                toast({ variant: 'destructive', title: 'File Too Large', description: `The image cannot exceed 2MB.`});
                e.target.value = '';
                return;
            }
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            setIsImageRemoved(false);
        }
    };
    
    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if (imageInputRef.current) {
            imageInputRef.current.value = '';
        }
        setIsImageRemoved(true); // Flag that the existing image should be removed
    }

    return (
         <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit Advertisement' : 'Create New Advertisement'}</DialogTitle>
                    <DialogDescription>
                        Fill in the details for your ad.
                    </DialogDescription>
                </DialogHeader>
                <form ref={formRef} onSubmit={handleFormAction} className="space-y-4">
                    <Tabs defaultValue="content" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="content">Content</TabsTrigger>
                            <TabsTrigger value="targeting">Targeting & Scheduling</TabsTrigger>
                        </TabsList>
                        <TabsContent value="content" className="py-4 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Ad Name</Label>
                                <Input id="name" name="name" placeholder="e.g., Summer Sale Banner" value={name} onChange={e => setName(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="link_url">Link URL</Label>
                                <Input id="link_url" name="link_url" placeholder="https://example.com/special-offer" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="image_file">Ad Creative (Image, Max 2MB)</Label>
                                <Input ref={imageInputRef} id="image_file" name="image_file" type="file" accept="image/*" onChange={handleImageChange} />
                                {imagePreview && (
                                    <div className="relative mt-2 w-fit">
                                        <Image src={imagePreview} alt="Ad preview" width={200} height={100} className="rounded-md object-cover border" />
                                        <Button type="button" variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={handleRemoveImage}>
                                            <X className="h-4 w-4" />
                                            <span className="sr-only">Remove Image</span>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                        <TabsContent value="targeting" className="py-4 space-y-4">
                             <div className="space-y-2">
                                <Label htmlFor="placement_id">Placement</Label>
                                <Select name="placement_id" value={placementId} onValueChange={setPlacementId}>
                                    <SelectTrigger id="placement_id">
                                        <SelectValue placeholder="Select a screen location" />
                                    </SelectTrigger>
                                    <SelectContent>{placements.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="target_audience_id">Audience</Label>
                                <Select name="target_audience_id" value={audienceId} onValueChange={setAudienceId}>
                                    <SelectTrigger id="target_audience_id"><SelectValue placeholder="Select user segment" /></SelectTrigger>
                                    <SelectContent>{audiences.map(a => <SelectItem key={a.id} value={a.id.toString()}>{a.name}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="status_id">Status</Label>
                                <Select name="status_id" value={statusId} onValueChange={setStatusId}>
                                    <SelectTrigger id="status_id"><SelectValue placeholder="Select status" /></SelectTrigger>
                                    <SelectContent>{statuses.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.status_name}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="is_global" name="is_global" checked={isGlobal} onCheckedChange={checked => setIsGlobal(Boolean(checked))} />
                                <Label htmlFor="is_global">Make this a Global Ad (shows for all organizations)</Label>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Start Date (Optional)</Label>
                                    <Popover><PopoverTrigger asChild><Button type="button" variant="outline" className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{startDate ? format(startDate, "PPP") : <span>Pick a date</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={startDate} onSelect={setStartDate} /></PopoverContent></Popover>
                                </div>
                                <div className="space-y-2">
                                    <Label>End Date (Optional)</Label>
                                    <Popover><PopoverTrigger asChild><Button type="button" variant="outline" className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{endDate ? format(endDate, "PPP") : <span>Pick a date</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={endDate} onSelect={setEndDate} /></PopoverContent></Popover>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                    <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                        <SubmitButton isEditing={isEditing} />
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

    