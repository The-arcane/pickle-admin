
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
import { FileUp } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
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
    const isEditing = !!ad;
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [startDate, setStartDate] = useState<Date | undefined>();
    const [endDate, setEndDate] = useState<Date | undefined>();

    useEffect(() => {
        if(ad) {
            setImagePreview(ad.image_url);
            setStartDate(ad.start_date ? new Date(ad.start_date) : undefined);
            setEndDate(ad.end_date ? new Date(ad.end_date) : undefined);
        } else {
            setImagePreview(null);
            setStartDate(undefined);
            setEndDate(undefined);
        }
    }, [ad]);

    const handleFormAction = async (formData: FormData) => {
        if(startDate) formData.set('start_date', startDate.toISOString());
        if(endDate) formData.set('end_date', endDate.toISOString());

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
            setImagePreview(URL.createObjectURL(file));
        }
    };
    
    const activeStatusId = statuses.find(s => s.status_name === 'Active')?.id;

    return (
         <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit Advertisement' : 'Create New Advertisement'}</DialogTitle>
                    <DialogDescription>
                        Fill in the details for your ad.
                    </DialogDescription>
                </DialogHeader>
                <form ref={formRef} action={handleFormAction} className="space-y-4">
                    <input type="hidden" name="id" value={ad?.id || ''} />
                    <input type="hidden" name="type_id" value={adTypeId} />
                    <input type="hidden" name="organisation_id" value={orgId || ''} />

                    <Tabs defaultValue="content" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="content">Content</TabsTrigger>
                            <TabsTrigger value="targeting">Targeting & Scheduling</TabsTrigger>
                        </TabsList>
                        <TabsContent value="content" className="py-4 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Ad Name</Label>
                                <Input id="name" name="name" placeholder="e.g., Summer Sale Banner" defaultValue={ad?.name} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="link_url">Link URL</Label>
                                <Input id="link_url" name="link_url" placeholder="https://example.com/special-offer" defaultValue={ad?.link_url} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="image_file">Ad Creative (Image, Max 2MB)</Label>
                                <Input id="image_file" name="image_file" type="file" accept="image/*" onChange={handleImageChange} />
                                {imagePreview && <Image src={imagePreview} alt="Ad preview" width={200} height={100} className="mt-2 rounded-md object-cover border" />}
                            </div>
                        </TabsContent>
                        <TabsContent value="targeting" className="py-4 space-y-4">
                             <div className="space-y-2">
                                <Label htmlFor="placement_id">Placement</Label>
                                <Select name="placement_id" defaultValue={ad?.placement_id?.toString()}>
                                    <SelectTrigger id="placement_id">
                                        <SelectValue placeholder="Select a screen location" />
                                    </SelectTrigger>
                                    <SelectContent>{placements.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="target_audience_id">Audience</Label>
                                <Select name="target_audience_id" defaultValue={ad?.target_audience_id?.toString()}>
                                    <SelectTrigger id="target_audience_id"><SelectValue placeholder="Select user segment" /></SelectTrigger>
                                    <SelectContent>{audiences.map(a => <SelectItem key={a.id} value={a.id.toString()}>{a.name}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="status_id">Status</Label>
                                <Select name="status_id" defaultValue={ad?.status_id?.toString() || activeStatusId?.toString()}>
                                    <SelectTrigger id="status_id"><SelectValue placeholder="Select status" /></SelectTrigger>
                                    <SelectContent>{statuses.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.status_name}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="is_global" name="is_global" defaultChecked={ad?.is_global} />
                                <Label htmlFor="is_global">Make this a Global Ad (shows for all organizations)</Label>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Start Date (Optional)</Label>
                                    <Popover><PopoverTrigger asChild><Button variant="outline" className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{startDate ? format(startDate, "PPP") : <span>Pick a date</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={startDate} onSelect={setStartDate} /></PopoverContent></Popover>
                                </div>
                                <div className="space-y-2">
                                    <Label>End Date (Optional)</Label>
                                    <Popover><PopoverTrigger asChild><Button variant="outline" className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{endDate ? format(endDate, "PPP") : <span>Pick a date</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={endDate} onSelect={setEndDate} /></PopoverContent></Popover>
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

