
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { addEvent, updateEvent, addEventGalleryImages, deleteEventGalleryImage } from './actions';
import type { Event, SubEvent, WhatToBringItem, Organisation, EventCategory, EventTag, User, EventGalleryImage } from './types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, ImagePlus, Calendar as CalendarIcon, Upload, Globe } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useFormStatus } from 'react-dom';
import { useOrganization } from '@/hooks/use-organization';

function GalleryUploadButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" size="sm" disabled={pending}>
            {pending ? 'Uploading...' : <><Upload className="mr-2 h-4 w-4" /> Upload Files</>}
        </Button>
    )
}

function DeleteButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" disabled={pending}>
            {pending ? '...' : <Trash2 className="h-4 w-4" />}
        </Button>
    )
}

export function EditEventClientPage({ event, organisations, users, categories, tags }: { event: Event | null, organisations: Organisation[], users: User[], categories: EventCategory[], tags: EventTag[] }) {
    const router = useRouter();
    const { toast } = useToast();
    const isAdding = !event;
    const [isClient, setIsClient] = useState(false);
    const { selectedOrgId } = useOrganization();

    // Form State
    const [isFree, setIsFree] = useState(true);
    const [isPublic, setIsPublic] = useState(true);
    const [organiserType, setOrganiserType] = useState<'user' | 'organisation'>('organisation');
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>();
    
    const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
    const coverImageRef = useRef<HTMLInputElement>(null);
    const [imageInPreview, setImageInPreview] = useState<string | null>(null);

    const galleryFormRef = useRef<HTMLFormElement>(null);
    const [galleryFiles, setGalleryFiles] = useState<FileList | null>(null);

    // Dynamic lists
    const [subEvents, setSubEvents] = useState<Partial<SubEvent>[]>([{ title: '', start_time: '', end_time: '' }]);
    const [whatToBring, setWhatToBring] = useState<Partial<WhatToBringItem>[]>([{ item: '' }]);
    
    useEffect(() => {
        setIsClient(true);
        if (event) {
            setIsFree(event.is_free ?? true);
            setIsPublic(event.is_public ?? true);
            setOrganiserType(event.organiser_user_id ? 'user' : 'organisation');
            setStartDate(event.start_time ? parseISO(event.start_time) : undefined);
            setEndDate(event.end_time ? parseISO(event.end_time) : undefined);
            setCoverImagePreview(event.cover_image || null);
            setSubEvents(event.event_sub_events.length > 0 ? event.event_sub_events.map(sub => ({
                ...sub,
                start_time: formatTimeToInputValue(sub.start_time),
                end_time: formatTimeToInputValue(sub.end_time),
            })) : [{ title: '', start_time: '', end_time: '' }]);
            setWhatToBring(event.event_what_to_bring.length > 0 ? event.event_what_to_bring : [{ item: '' }]);
        }
    }, [event]);

    const formatTimeToInputValue = (isoString: string | null | undefined): string => {
        if (!isoString) return '';
        try {
            return format(new Date(isoString), 'HH:mm');
        } catch (e) {
            console.error("Failed to format time", e);
            return '';
        }
    };

    const handleFormAction = async (formData: FormData) => {
        if(startDate) formData.append('start_time', startDate.toISOString());
        if(endDate) formData.append('end_time', endDate.toISOString());
        
        formData.append('is_free', String(isFree));
        formData.append('is_public', String(isPublic));
        formData.append('sub_events', JSON.stringify(subEvents.filter(s => s.title)));
        formData.append('what_to_bring', JSON.stringify(whatToBring.filter(s => s.item)));
        
        // Based on the toggle, set the access_type
        formData.append('access_type', isPublic ? 'public' : 'private');

        const action = isAdding ? addEvent : updateEvent;
        if (!isAdding && event) {
            formData.append('id', event.id.toString());
        } else if (isAdding && selectedOrgId && organiserType === 'organisation') {
            formData.append('organiser_org_id', selectedOrgId.toString());
        }
        
        const result = await action(formData);

        if (result?.error) {
            toast({ variant: "destructive", title: "Error", description: result.error });
        } else {
            toast({ title: "Success", description: `Event ${isAdding ? 'added' : 'updated'} successfully.` });
            router.push('/super-admin/events');
            router.refresh();
        }
    };
    
    const handleGallerySubmit = async (formData: FormData) => {
        const result = await addEventGalleryImages(formData);
        if (result?.error) {
            toast({ variant: "destructive", title: "Error", description: result.error });
        } else {
            toast({ title: "Success", description: "Gallery images uploaded." });
            setGalleryFiles(null);
            galleryFormRef.current?.reset();
        }
    };

    const onGalleryFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        await handleGallerySubmit(formData);
    }
    
    const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                toast({
                    variant: 'destructive',
                    title: 'File Too Large',
                    description: 'The cover image cannot exceed 2MB.',
                });
                e.target.value = ''; // Reset the input
                return;
            }
            setCoverImagePreview(URL.createObjectURL(file));
        }
    };

    // Sub-events handlers
    const handleAddSubEvent = () => setSubEvents([...subEvents, { title: '', start_time: '', end_time: '' }]);
    const handleRemoveSubEvent = (index: number) => setSubEvents(subEvents.filter((_, i) => i !== index));
    const handleSubEventChange = (index: number, field: keyof SubEvent, value: any) => {
        const newSubEvents = [...subEvents];
        (newSubEvents[index] as any)[field] = value;
        setSubEvents(newSubEvents);
    };

    // What to bring handlers
    const handleAddBringItem = () => setWhatToBring([...whatToBring, { item: '' }]);
    const handleRemoveBringItem = (index: number) => setWhatToBring(whatToBring.filter((_, i) => i !== index));
    const handleBringItemChange = (index: number, value: string) => {
        const newItems = [...whatToBring];
        newItems[index].item = value;
        setWhatToBring(newItems);
    };

    const selectedOrganisation = organisations.find(o => o.id === selectedOrgId);

    return (
        <>
            <div className="space-y-8">
                 <form action={handleFormAction} className="space-y-8">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold">{isAdding ? 'Add New Event' : 'Edit Event'}</h1>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" type="button" asChild><Link href="/super-admin/events">Cancel</Link></Button>
                            <Button type="submit">Save Changes</Button>
                        </div>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Event Details</CardTitle>
                            <CardDescription>Basic information about the event.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2"><Label htmlFor="title">Event Title</Label><Input id="title" name="title" defaultValue={event?.title || ''} placeholder="e.g., Summer Tennis Tournament" required/></div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2"><Label htmlFor="type">Event Type</Label><Input id="type" name="type" defaultValue={event?.type || ''} placeholder="e.g., Tournament, Workshop" /></div>
                            <div className="space-y-2"><Label htmlFor="location_name">Location Name</Label><Input id="location_name" name="location_name" defaultValue={event?.location_name || ''} placeholder="e.g., City Sports Complex"/></div>
                            </div>
                            <div className="space-y-2"><Label htmlFor="description">Description</Label><Textarea id="description" name="description" defaultValue={event?.description || ''} rows={4}/></div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Start Date & Time</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {startDate ? 
                                                    (isClient ? format(startDate, "PPP p") : <Skeleton className="h-4 w-[200px]" />) : 
                                                    (<span>Pick a date and time</span>)
                                                }
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="space-y-2">
                                    <Label>End Date & Time</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}>
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {endDate ? 
                                                    (isClient ? format(endDate, "PPP p") : <Skeleton className="h-4 w-[200px]" />) : 
                                                    (<span>Pick a date and time</span>)
                                                }
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                            <div className="space-y-2"><Label htmlFor="address">Address</Label><Input id="address" name="address" defaultValue={event?.address || ''} /></div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2"><Label htmlFor="latitude">Latitude</Label><Input id="latitude" name="latitude" type="number" step="any" defaultValue={event?.latitude ?? ''} /></div>
                                <div className="space-y-2"><Label htmlFor="longitude">Longitude</Label><Input id="longitude" name="longitude" type="number" step="any" defaultValue={event?.longitude ?? ''} /></div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Organization & Access</CardTitle>
                            <CardDescription>Set the event organizer and access rules.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-3">
                                <Label>Organiser Type</Label>
                                <RadioGroup name="organiser_type" value={organiserType} onValueChange={(val) => setOrganiserType(val as 'user' | 'organisation')} className="flex gap-4">
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="organisation" id="r_org" />
                                        <Label htmlFor="r_org">Organisation</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="user" id="r_user" />
                                        <Label htmlFor="r_user">User</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                            
                            {organiserType === 'organisation' ? (
                                <div className="space-y-2">
                                    <Label htmlFor="organiser_org_id">Organiser Organisation</Label>
                                    <Input value={selectedOrganisation?.name || ''} disabled />
                                    <input type="hidden" name="organiser_org_id" value={selectedOrgId || event?.organiser_org_id || ''} />
                                </div>
                            ) : (
                                <div className="space-y-2"><Label htmlFor="organiser_user_id">Organiser User</Label><Select name="organiser_user_id" defaultValue={event?.organiser_user_id?.toString() || ''}><SelectTrigger><SelectValue placeholder="Select a user" /></SelectTrigger><SelectContent>{users.map(user => <SelectItem key={user.id} value={user.id.toString()}>{user.name}</SelectItem>)}</SelectContent></Select></div>
                            )}
                            
                            <div className="space-y-2">
                                <Label htmlFor="timezone">Timezone</Label>
                                <Input id="timezone" name="timezone" defaultValue={event?.timezone || 'Asia/Kolkata'} placeholder="e.g., Asia/Kolkata" />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-center gap-2 rounded-lg border p-3"><Switch id="is_discoverable" name="is_discoverable" defaultChecked={event?.is_discoverable ?? true}/><Label htmlFor="is_discoverable">Discoverable</Label></div>
                                <div className="flex items-center gap-2 rounded-lg border p-3"><Switch id="requires_login" name="requires_login" defaultChecked={event?.requires_login ?? false}/><Label htmlFor="requires_login">Requires Login</Label></div>
                                <div className="flex items-center gap-2 rounded-lg border p-3"><Switch id="requires_invitation_code" name="requires_invitation_code" defaultChecked={event?.requires_invitation_code ?? false}/><Label htmlFor="requires_invitation_code">Invitation Code</Label></div>
                                <div className="flex items-center gap-2 rounded-lg border p-3"><Switch id="is_public" name="is_public" checked={isPublic} onCheckedChange={setIsPublic}/><Label htmlFor="is_public" className="flex items-center gap-2"><Globe className="h-4 w-4" /> Publicly Visible</Label></div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Pricing & Capacity</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <Label htmlFor="is_free" className="text-base font-medium">Is this a free event?</Label>
                                <Switch id="is_free" checked={isFree} onCheckedChange={setIsFree}/>
                            </div>
                            {!isFree && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border p-4 rounded-md">
                                    <div className="space-y-2"><Label htmlFor="amount">Amount</Label><Input id="amount" name="amount" type="number" defaultValue={event?.amount ?? ''}/></div>
                                    <div className="space-y-2"><Label htmlFor="currency">Currency</Label><Input id="currency" name="currency" defaultValue={event?.currency || 'INR'}/></div>
                                    <div className="md:col-span-2 space-y-2"><Label htmlFor="pricing_notes">Pricing Notes</Label><Textarea id="pricing_notes" name="pricing_notes" defaultValue={event?.pricing_notes || ''} placeholder="e.g., Tickets are non-refundable"/></div>
                                </div>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2"><Label htmlFor="max_total_capacity">Max Total Capacity</Label><Input id="max_total_capacity" name="max_total_capacity" type="number" defaultValue={event?.max_total_capacity ?? ''} placeholder="Total number of attendees" /></div>
                                <div className="space-y-2"><Label htmlFor="max_bookings_per_user">Max Bookings Per User</Label><Input id="max_bookings_per_user" name="max_bookings_per_user" type="number" defaultValue={event?.max_bookings_per_user ?? ''} placeholder="Limit per user account" /></div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader>
                            <CardTitle>Sub-Events / Schedule</CardTitle>
                            <CardDescription>Break down the event into smaller parts or a schedule.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {subEvents.map((sub, index) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_0.5fr_0.5fr_auto] items-end gap-2 p-2 border rounded-md">
                                    <div className="space-y-2"><Label>Title</Label><Input value={sub.title || ''} onChange={(e) => handleSubEventChange(index, 'title', e.target.value)} placeholder="e.g., Registration" /></div>
                                    <div className="space-y-2"><Label>Start Time</Label><Input type="time" value={sub.start_time || ''} onChange={(e) => handleSubEventChange(index, 'start_time', e.target.value)} /></div>
                                    <div className="space-y-2"><Label>End Time</Label><Input type="time" value={sub.end_time || ''} onChange={(e) => handleSubEventChange(index, 'end_time', e.target.value)} /></div>
                                    <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveSubEvent(index)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                </div>
                            ))}
                            <Button type="button" variant="outline" size="sm" onClick={handleAddSubEvent}><Plus className="mr-2 h-4 w-4" /> Add Schedule Item</Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Media & Links</CardTitle>
                            <CardDescription>Upload a cover image (max 2MB) and add a video link for your event.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="cover_image_file">Cover Image</Label>
                                    <input type="file" id="cover_image_file" accept="image/*" ref={coverImageRef} name="cover_image_file" className="hidden" onChange={handleCoverImageChange} />
                                    <Button type="button" variant="outline" size="sm" className="h-auto py-1.5 ml-auto" onClick={() => coverImageRef.current?.click()}>
                                        <ImagePlus className="mr-2 h-4 w-4" /> Upload Image
                                    </Button>
                                </div>
                                {coverImagePreview && (
                                    <button type="button" className="mt-3 block w-full max-w-sm rounded-md overflow-hidden cursor-pointer" onClick={() => setImageInPreview(coverImagePreview)}>
                                        <Image src={coverImagePreview} alt="Event Cover Preview" width={600} height={400} className="w-full h-auto object-cover" />
                                    </button>
                                )}
                            </div>
                            <div className="space-y-2">
                            <Label htmlFor="video_url">Video URL</Label>
                            <Input id="video_url" name="video_url" defaultValue={event?.video_url ?? ''} placeholder="e.g., https://youtube.com/watch?v=..." />
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader><CardTitle>Additional Information</CardTitle></CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <Label>What to Bring</Label>
                                {whatToBring.map((item, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <Input value={item.item || ''} onChange={(e) => handleBringItemChange(index, e.target.value)} placeholder="e.g., Water Bottle" />
                                        <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveBringItem(index)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                    </div>
                                ))}
                                <Button type="button" variant="outline" size="sm" onClick={handleAddBringItem}><Plus className="mr-2 h-4 w-4"/> Add Item</Button>
                            </div>
                            <Separator/>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="flex items-center gap-2 rounded-lg border p-3"><Switch id="is_family_friendly" name="is_family_friendly" defaultChecked={event?.is_family_friendly ?? false}/><Label htmlFor="is_family_friendly">Family Friendly</Label></div>
                                <div className="flex items-center gap-2 rounded-lg border p-3"><Switch id="is_outdoor" name="is_outdoor" defaultChecked={event?.is_outdoor ?? false}/><Label htmlFor="is_outdoor">Outdoors</Label></div>
                                <div className="flex items-center gap-2 rounded-lg border p-3"><Switch id="has_parking" name="has_parking" defaultChecked={event?.has_parking ?? false}/><Label htmlFor="has_parking">Parking</Label></div>
                                <div className="flex items-center gap-2 rounded-lg border p-3"><Switch id="is_accessible" name="is_accessible" defaultChecked={event?.is_accessible ?? false}/><Label htmlFor="is_accessible">Wheelchair Accessible</Label></div>
                                <div className="flex items-center gap-2 rounded-lg border p-3"><Switch id="pets_allowed" name="pets_allowed" defaultChecked={event?.pets_allowed ?? false}/><Label htmlFor="pets_allowed">Pets Allowed</Label></div>
                                <div className="flex items-center gap-2 rounded-lg border p-3"><Switch id="security_on_site" name="security_on_site" defaultChecked={event?.security_on_site ?? false}/><Label htmlFor="security_on_site">Security On-site</Label></div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex items-center justify-end gap-2 sticky bottom-0 bg-background py-4">
                        <Button variant="outline" type="button" asChild><Link href="/super-admin/events">Cancel</Link></Button>
                        <Button type="submit">Save Changes</Button>
                    </div>
                </form>

                {/* Gallery Section */}
                {!isAdding && event && (
                    <Card id="event-gallery-section" className="scroll-mt-24">
                        <CardHeader>
                            <CardTitle>Event Gallery</CardTitle>
                            <CardDescription>Upload multiple images for the event gallery.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <form ref={galleryFormRef} onSubmit={onGalleryFormSubmit} className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center">
                                <input type="hidden" name="event_id" value={event.id} />
                                <Label htmlFor="event-gallery-images" className="mb-4 cursor-pointer">
                                    <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                                    <span className="mt-2 block font-semibold text-primary">Click to upload or drag & drop</span>
                                    <span className="mt-1 block text-sm text-muted-foreground">Images only, max 2MB each</span>
                                </Label>
                                <Input
                                    id="event-gallery-images"
                                    name="images"
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    className="sr-only"
                                    onChange={(e) => setGalleryFiles(e.target.files)}
                                />
                                {galleryFiles && galleryFiles.length > 0 && (
                                    <div className="my-4 w-full max-w-md text-left">
                                        <p className="font-medium text-sm mb-2">Selected files ({galleryFiles.length}):</p>
                                        <div className="space-y-1 border rounded-md p-2 max-h-32 overflow-y-auto">
                                            {Array.from(galleryFiles).map((file, index) => (
                                                <p key={index} className="text-xs text-muted-foreground truncate">{file.name}</p>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <GalleryUploadButton />
                            </form>
                            
                            {event.event_gallery_images && event.event_gallery_images.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {event.event_gallery_images.map((image) => (
                                        <div key={image.id} className="relative group">
                                            <Image
                                                src={image.image_url}
                                                alt={`Event gallery image ${image.id}`}
                                                width={300}
                                                height={200}
                                                className="rounded-md object-cover w-full aspect-video"
                                            />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                                 <form action={deleteEventGalleryImage}>
                                                    <input type="hidden" name="event_id" value={event.id} />
                                                    <input type="hidden" name="image_id" value={image.id} />
                                                    <input type="hidden" name="image_url" value={image.image_url} />
                                                    <DeleteButton />
                                                </form>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center">No gallery images have been uploaded for this event.</p>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
            
            <Dialog open={!!imageInPreview} onOpenChange={(isOpen) => !isOpen && setImageInPreview(null)}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Image Preview</DialogTitle>
                    </DialogHeader>
                    {imageInPreview && (
                        <Image
                            src={imageInPreview}
                            alt="Full preview"
                            width={1200}
                            height={800}
                            sizes="100vw"
                            style={{ width: '100%', height: 'auto' }}
                            className="rounded-md mx-auto"
                        />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
