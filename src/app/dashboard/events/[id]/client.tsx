'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { addEvent, updateEvent } from '../actions';
import type { Event, SubEvent, GalleryImage, WhatToBringItem, Organisation, EventCategory, EventTag } from './types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, ImagePlus, X, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';

export function EditEventClientPage({ event, organisations, categories, tags }: { event: Event | null, organisations: Organisation[], categories: EventCategory[], tags: EventTag[] }) {
    const router = useRouter();
    const { toast } = useToast();
    const isAdding = !event;

    // Form State
    const [isFree, setIsFree] = useState(event?.is_free ?? true);
    const [startDate, setStartDate] = useState<Date | undefined>(event?.start_time ? parseISO(event.start_time) : undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(event?.end_time ? parseISO(event.end_time) : undefined);

    const formatTimeToInputValue = (isoString: string | null | undefined): string => {
        if (!isoString) return '';
        try {
            // new Date(isoString) works fine with full ISO strings
            return format(new Date(isoString), 'HH:mm');
        } catch (e) {
            console.error("Failed to format time", e);
            return '';
        }
    };

    // Dynamic lists
    const [subEvents, setSubEvents] = useState<Partial<SubEvent>[]>(
        event?.event_sub_events.map(sub => ({
            ...sub,
            start_time: formatTimeToInputValue(sub.start_time),
            end_time: formatTimeToInputValue(sub.end_time),
        })) ?? []
    );
    const [gallery, setGallery] = useState<Partial<GalleryImage>[]>(event?.event_gallery_images ?? []);
    const [whatToBring, setWhatToBring] = useState<Partial<WhatToBringItem>[]>(event?.event_what_to_bring ?? []);
    const [newImageUrl, setNewImageUrl] = useState('');

    const handleFormAction = async (formData: FormData) => {
        if(startDate) formData.append('start_time', startDate.toISOString());
        if(endDate) formData.append('end_time', endDate.toISOString());
        
        formData.append('is_free', String(isFree));
        formData.append('sub_events', JSON.stringify(subEvents));
        formData.append('gallery', JSON.stringify(gallery));
        formData.append('what_to_bring', JSON.stringify(whatToBring));

        const action = isAdding ? addEvent : updateEvent;
        if (!isAdding && event) {
            formData.append('id', event.id.toString());
        }
        
        const result = await action(formData);

        if (result?.error) {
            toast({ variant: "destructive", title: "Error", description: result.error });
        } else {
            toast({ title: "Success", description: `Event ${isAdding ? 'added' : 'updated'} successfully.` });
            router.push('/dashboard/events');
            router.refresh();
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

    // Gallery handlers
    const handleAddImage = () => {
        if (newImageUrl.trim()) {
            setGallery([...gallery, { image_url: newImageUrl.trim() }]);
            setNewImageUrl('');
        }
    };
    const handleRemoveImage = (index: number) => setGallery(gallery.filter((_, i) => i !== index));

    // What to bring handlers
    const handleAddBringItem = () => setWhatToBring([...whatToBring, { item: '' }]);
    const handleRemoveBringItem = (index: number) => setWhatToBring(whatToBring.filter((_, i) => i !== index));
    const handleBringItemChange = (index: number, value: string) => {
        const newItems = [...whatToBring];
        newItems[index].item = value;
        setWhatToBring(newItems);
    };


    return (
        <form action={handleFormAction} className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">{isAdding ? 'Add New Event' : 'Edit Event'}</h1>
                <div className="flex items-center gap-2">
                    <Button variant="outline" type="button" asChild><Link href="/dashboard/events">Cancel</Link></Button>
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
                    <div className="space-y-2"><Label htmlFor="description">Description</Label><Textarea id="description" name="description" defaultValue={event?.description || ''} rows={4}/></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Start Date & Time</Label>
                             <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {startDate ? format(startDate, "PPP p") : <span>Pick a date</span>}
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
                                        {endDate ? format(endDate, "PPP p") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2"><Label htmlFor="location_name">Location Name</Label><Input id="location_name" name="location_name" defaultValue={event?.location_name || ''} placeholder="e.g., City Sports Complex"/></div>
                        <div className="space-y-2"><Label htmlFor="address">Address</Label><Input id="address" name="address" defaultValue={event?.address || ''} /></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2"><Label htmlFor="latitude">Latitude</Label><Input id="latitude" name="latitude" type="number" step="any" defaultValue={event?.latitude ?? ''} /></div>
                        <div className="space-y-2"><Label htmlFor="longitude">Longitude</Label><Input id="longitude" name="longitude" type="number" step="any" defaultValue={event?.longitude ?? ''} /></div>
                    </div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Organization & Pricing</CardTitle>
                    <CardDescription>Organizer details and event pricing.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2"><Label htmlFor="organiser_org_id">Organiser</Label><Select name="organiser_org_id" defaultValue={event?.organiser_org_id?.toString() || ''}><SelectTrigger><SelectValue placeholder="Select an organiser" /></SelectTrigger><SelectContent>{organisations.map(org => <SelectItem key={org.id} value={org.id.toString()}>{org.name}</SelectItem>)}</SelectContent></Select></div>
                        <div className="space-y-2"><Label htmlFor="type">Event Type</Label><Input id="type" name="type" defaultValue={event?.type || ''} placeholder="e.g., Tournament, Workshop, Social" /></div>
                    </div>
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
                    <div className="space-y-2"><Label htmlFor="max_total_capacity">Max Capacity</Label><Input id="max_total_capacity" name="max_total_capacity" type="number" defaultValue={event?.max_total_capacity ?? ''} placeholder="Total number of attendees" /></div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Sub-Events / Schedule</CardTitle><CardDescription>Break down the event into smaller parts or a schedule.</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                    {subEvents.map((sub, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_0.5fr_0.5fr_auto] items-end gap-2 p-2 border rounded-md">
                             <div className="space-y-2"><Label>Title</Label><Input value={sub.title || ''} onChange={(e) => handleSubEventChange(index, 'title', e.target.value)} placeholder="e.g., Registration" /></div>
                             <div className="space-y-2"><Label>Start Time</Label><Input type="time" value={sub.start_time || ''} onChange={(e) => handleSubEventChange(index, 'start_time', e.target.value)} /></div>
                             <div className="space-y-2"><Label>End Time</Label><Input type="time" value={sub.end_time || ''} onChange={(e) => handleSubEventChange(index, 'end_time', e.target.value)} /></div>
                             <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveSubEvent(index)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                        </div>
                    ))}
                    <Button type="button" variant="outline" onClick={handleAddSubEvent}><Plus className="mr-2 h-4 w-4" /> Add Schedule Item</Button>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader><CardTitle>Event Gallery</CardTitle><CardDescription>Add images for the event.</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {gallery.map((img, index) => (
                            <div key={index} className="relative group aspect-video">
                                <img src={img.image_url || 'https://placehold.co/300x200.png'} alt={`Event image ${index + 1}`} className="rounded-md object-cover w-full h-full"/>
                                <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => handleRemoveImage(index)}><X className="h-4 w-4"/></Button>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <Input placeholder="Enter new image URL" value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} />
                        <Button type="button" onClick={handleAddImage}><ImagePlus className="mr-2 h-4 w-4"/> Add Image</Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Additional Information</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
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
                <Button variant="outline" type="button" asChild><Link href="/dashboard/events">Cancel</Link></Button>
                <Button type="submit">Save Changes</Button>
            </div>
        </form>
    );
}
