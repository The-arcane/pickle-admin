
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { addCourt, updateCourt, addCourtGalleryImages, deleteCourtGalleryImage } from './actions';
import type { Court, Organisation, Sport, CourtRule, CourtContact, AvailabilityBlock, RecurringUnavailability, CourtGalleryImage } from './types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Lightbulb, Plus, Trash2, ImagePlus, Calendar as CalendarIcon, Upload, Globe } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useFormStatus } from 'react-dom';
import { useOrganization } from '@/hooks/use-organization';

const daysOfWeek = [
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, 'label': 'Thursday' },
    { value: 5, 'label': 'Friday' },
    { value: 6, 'label': 'Saturday' },
    { value: 0, 'label': 'Sunday' },
];

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

export function EditCourtClientPage({ court, organisations, sports }: { court: Court | null, organisations: Organisation[], sports: Sport[] }) {
    const router = useRouter();
    const { toast } = useToast();
    const isAdding = !court;
    const { selectedOrgId } = useOrganization();
    
    // Form State
    const [equipmentRental, setEquipmentRental] = useState(false);
    const [floodlights, setFloodlights] = useState(false);
    const [isPublic, setIsPublic] = useState(true);
    const [oneBookingPerDay, setOneBookingPerDay] = useState(false);
    const [isBookingRolling, setIsBookingRolling] = useState(false);
    
    // State for related tables
    const [rules, setRules] = useState<Partial<CourtRule>[]>([{ rule: '' }]);
    const [contact, setContact] = useState<Partial<CourtContact>>({});
    
    const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
    const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
    const mainImageRef = useRef<HTMLInputElement>(null);
    const coverImageRef = useRef<HTMLInputElement>(null);
    
    const [availability, setAvailability] = useState<Partial<AvailabilityBlock>[]>([]);
    const [unavailability, setUnavailability] = useState<Partial<RecurringUnavailability>[]>([]);  
    const [activeSection, setActiveSection] = useState('court-info');
    
    const [imageInPreview, setImageInPreview] = useState<string | null>(null);

    const galleryFormRef = useRef<HTMLFormElement>(null);
    const [galleryFiles, setGalleryFiles] = useState<FileList | null>(null);

     // Set state from props after initial render to avoid hydration mismatch
    useEffect(() => {
        if (court) {
            setEquipmentRental(court.is_equipment_available ?? false);
            setFloodlights(court.has_floodlights ?? false);
            setIsPublic(court.is_public ?? true);
            setOneBookingPerDay(court.one_booking_per_user_per_day ?? false);
            setIsBookingRolling(court.is_booking_rolling ?? false);
            setRules(court.court_rules.length > 0 ? court.court_rules : [{ rule: '' }]);
            setContact(court.court_contacts?.[0] ?? {});
            setAvailability(court.availability_blocks ?? []);
            setUnavailability(court.recurring_unavailability ?? []);
            setMainImagePreview(court.image || null);
            setCoverImagePreview(court.cover_image || null);
        }
    }, [court]);


    const navSections = [
        { id: 'court-info', label: 'Court Info' },
        { id: 'court-availability', label: 'Availability' },
        { id: 'advanced-rules', label: 'Booking Rules'},
        { id: 'images-pricing', label: 'Images & Pricing' },
        { id: 'court-gallery-section', label: 'Gallery' },
        { id: 'court-rules', label: 'Rules' },
        { id: 'contact-info', label: 'Contact' },
    ];

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            { rootMargin: "-25% 0px -75% 0px" }
        );

        const sections = navSections.map(section => document.getElementById(section.id));
        sections.forEach(section => {
            if (section) observer.observe(section);
        });

        return () => {
            sections.forEach(section => {
                if (section) observer.unobserve(section);
            });
        };
    }, []); 

    const handleFormAction = async (formData: FormData) => {
        formData.append('is_equipment_available', String(equipmentRental));
        formData.append('has_floodlights', String(floodlights));
        formData.append('is_public', String(isPublic));
        formData.append('one_booking_per_user_per_day', String(oneBookingPerDay));
        formData.append('is_booking_rolling', String(isBookingRolling));
        formData.append('rules', JSON.stringify(rules.filter(r => r.rule && r.rule.trim() !== '')));
        formData.append('contact', JSON.stringify(contact));
        formData.append('availability', JSON.stringify(availability.filter(a => a.date)));
        formData.append('unavailability', JSON.stringify(unavailability.filter(u => u.day_of_week !== undefined && u.start_time && u.end_time)));

        const action = isAdding ? addCourt : updateCourt;
        if (!isAdding && court) {
            formData.append('id', court.id.toString());
        } else if (isAdding && selectedOrgId) {
            formData.set('organisation_id', selectedOrgId.toString());
        }
        
        const result = await action(formData);

        if (result?.error) {
            toast({ variant: "destructive", title: "Error", description: result.error });
        } else {
            toast({ title: "Success", description: `Court ${isAdding ? 'added' : 'updated'} successfully.` });
            router.push('/super-admin/courts');
            router.refresh();
        }
    };

    const handleGallerySubmit = async (formData: FormData) => {
        const result = await addCourtGalleryImages(formData);
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
    
    const handleAddRule = () => setRules([...rules, { rule: '' }]);
    const handleRemoveRule = (index: number) => setRules(rules.filter((_, i) => i !== index));
    const handleRuleChange = (index: number, value: string) => {
        const newRules = [...rules];
        newRules[index].rule = value;
        setRules(newRules);
    };

    // For one-off unavailability (availability_blocks)
    const handleAddAvailability = () => setAvailability([...availability, { date: null, start_time: null, end_time: null, reason: '' }]);
    const handleRemoveAvailability = (index: number) => setAvailability(availability.filter((_, i) => i !== index));
    const handleAvailabilityChange = (index: number, field: keyof AvailabilityBlock, value: any) => {
        const newAvailability = [...availability] as any[];
        newAvailability[index][field] = value;
        setAvailability(newAvailability);
    };

    // For recurring unavailability
    const handleAddUnavailability = () => setUnavailability([...unavailability, { day_of_week: 1, start_time: '12:00', end_time: '13:00', reason: '', active: true }]);
    const handleRemoveUnavailability = (index: number) => setUnavailability(unavailability.filter((_, i) => i !== index));
    const handleUnavailabilityChange = (index: number, field: keyof RecurringUnavailability, value: string | number) => {
        const newUnavailability = [...unavailability];
        (newUnavailability[index] as any)[field] = value;
        setUnavailability(newUnavailability);
    };

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const selectedOrganisation = organisations.find(o => o.id === (court?.organisation_id ?? selectedOrgId));


    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            <aside className="hidden lg:block lg:col-span-1">
                <div className="sticky top-24">
                    <h3 className="font-semibold text-sm text-muted-foreground px-2 mb-2">Page Sections</h3>
                     <nav className="flex flex-col gap-1">
                        {navSections.map(section => (
                             <Button
                                key={section.id}
                                type="button"
                                variant={activeSection === section.id ? 'secondary' : 'ghost'}
                                className="w-full justify-start h-9"
                                onClick={() => scrollToSection(section.id)}
                            >
                                {section.label}
                            </Button>
                        ))}
                    </nav>
                </div>
            </aside>

            <div className="col-span-1 lg:col-span-4 space-y-8">
                <form action={handleFormAction} className="space-y-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <h1 className="text-3xl font-bold">{isAdding ? 'Add New Court' : 'Edit Court'}</h1>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Button variant="outline" type="button" asChild className="flex-1 sm:flex-initial"><Link href="/super-admin/courts">Cancel</Link></Button>
                            <Button type="submit" className="flex-1 sm:flex-initial">Save Changes</Button>
                        </div>
                    </div>

                    {/* Court Info Section */}
                    <Card id="court-info" className="scroll-mt-24">
                        <CardHeader>
                            <CardTitle>Court Info</CardTitle>
                            <CardDescription>Basic details about the court.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2"><Label htmlFor="name">Court Name</Label><Input id="name" name="name" defaultValue={court?.name || ''} placeholder="e.g., Court A" required/></div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="organisation_id">Venue Name</Label>
                                    <Input id="organisation_name" name="organisation_name" value={selectedOrganisation?.name || ''} disabled />
                                    <input type="hidden" name="organisation_id" value={court?.organisation_id || selectedOrgId || ''} />
                                </div>
                                <div className="space-y-2"><Label htmlFor="address">Address</Label><Input id="address" name="address" defaultValue={court?.address || selectedOrganisation?.address || ''} placeholder="Court address" required/></div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2"><Label htmlFor="lat">Latitude</Label><Input id="lat" name="lat" type="number" step="any" defaultValue={court?.lat ?? ''} placeholder="e.g., 28.6139" required/></div>
                                <div className="space-y-2"><Label htmlFor="lng">Longitude</Label><Input id="lng" name="lng" type="number" step="any" defaultValue={court?.lng ?? ''} placeholder="e.g., 77.2090" required/></div>
                            </div>
                            <div className="space-y-2"><Label htmlFor="sport_id">Sports Type</Label><Select name="sport_id" defaultValue={court?.sport_id?.toString() || ''} required><SelectTrigger><SelectValue placeholder="Select sport" /></SelectTrigger><SelectContent>{sports.map(sport => <SelectItem key={sport.id} value={sport.id.toString()}>{sport.name}</SelectItem>)}</SelectContent></Select></div>
                            <div className="space-y-2"><Label htmlFor="description">Court Description/Overview</Label><Textarea id="description" name="description" defaultValue={court?.description || ''} rows={4}/></div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2"><Label htmlFor="surface">Court Surface</Label><Input id="surface" name="surface" defaultValue={court?.surface || ''} placeholder="e.g., Hard, Clay, Grass"/></div>
                                <div className="space-y-2"><Label htmlFor="feature">Feature</Label><Input id="feature" name="feature" defaultValue={court?.feature || ''} placeholder="e.g., 'Indoor', 'Premiere Court'" /></div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2"><Label htmlFor="max_players">Max Players</Label><Input id="max_players" name="max_players" type="number" defaultValue={court?.max_players ?? undefined} /></div>
                                <div className="space-y-2"><Label htmlFor="audience_capacity">Audience Capacity</Label><Input id="audience_capacity" name="audience_capacity" type="number" defaultValue={court?.audience_capacity ?? undefined} /></div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="flex items-center justify-between rounded-lg border p-4"><Label htmlFor="has_floodlights" className="text-base font-medium flex items-center gap-2"><Lightbulb className="h-4 w-4"/> Floodlights</Label><Switch id="has_floodlights" name="has_floodlights" checked={floodlights} onCheckedChange={setFloodlights}/></div>
                                <div className="flex items-center justify-between rounded-lg border p-4"><Label htmlFor="is_equipment_available" className="text-base font-medium">Equipment</Label><Switch id="is_equipment_available" name="is_equipment_available" checked={equipmentRental} onCheckedChange={setEquipmentRental}/></div>
                                <div className="flex items-center justify-between rounded-lg border p-4"><Label htmlFor="is_public" className="text-base font-medium flex items-center gap-2"><Globe className="h-4 w-4"/> Public</Label><Switch id="is_public" name="is_public" checked={isPublic} onCheckedChange={setIsPublic}/></div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Availability Section */}
                    <Card id="court-availability" className="scroll-mt-24">
                        <CardHeader>
                            <CardTitle>Court Availability</CardTitle>
                            <CardDescription>Set business hours, one-off unavailable dates, and recurring weekly unavailable times.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="c_start_time">Business Hours Start</Label>
                                    <Input id="c_start_time" name="c_start_time" type="time" defaultValue={court?.c_start_time || ''} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="c_end_time">Business Hours End</Label>
                                    <Input id="c_end_time" name="c_end_time" type="time" defaultValue={court?.c_end_time || ''} />
                                </div>
                            </div>
                            <Separator />
                            <div className="space-y-4">
                                <Label className="text-base font-medium">One-off Unavailability</Label>
                                <CardDescription>Block specific dates and times (e.g., for maintenance or special events). Leave times blank to block the entire day.</CardDescription>
                                {availability.map((block, index) => (
                                    <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_0.75fr_0.75fr_1fr_auto] items-center gap-2 p-2 border rounded-md">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button type="button" variant="outline" className={cn("w-full justify-start text-left font-normal", !block.date && "text-muted-foreground")}>
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {block.date ? format(new Date(block.date), "PPP") : <span>Pick a date</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={block.date ? new Date(block.date) : undefined} onSelect={(date) => handleAvailabilityChange(index, 'date', date ? format(date, 'yyyy-MM-dd') : null)} initialFocus/></PopoverContent>
                                        </Popover>
                                        <Input type="time" placeholder="Start (optional)" value={block.start_time ?? ''} onChange={(e) => handleAvailabilityChange(index, 'start_time', e.target.value || null)} />
                                        <Input type="time" placeholder="End (optional)" value={block.end_time ?? ''} onChange={(e) => handleAvailabilityChange(index, 'end_time', e.target.value || null)} />
                                        <Input placeholder="Reason (optional)" value={block.reason || ''} onChange={(e) => handleAvailabilityChange(index, 'reason', e.target.value)} />
                                        <Button type="button" variant="ghost" size="icon" className="justify-self-end" onClick={() => handleRemoveAvailability(index)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                    </div>
                                ))}
                                <Button type="button" variant="outline" size="sm" className="h-auto py-1.5" onClick={handleAddAvailability}><Plus className="mr-2 h-4 w-4" /> Add Date</Button>
                            </div>
                            <Separator />
                            <div className="space-y-4">
                                <Label className="text-base font-medium">Recurring Unavailability</Label>
                                <CardDescription>The court will not be available on that particular day recurringly based on day and time.</CardDescription>
                                {unavailability.map((block, index) => (
                                    <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_0.75fr_0.75fr_1fr_auto] items-center gap-2 p-2 border rounded-md">
                                        <Select value={block.day_of_week?.toString()} onValueChange={(val) => handleUnavailabilityChange(index, 'day_of_week', parseInt(val, 10))}>
                                            <SelectTrigger><SelectValue placeholder="Select day"/></SelectTrigger>
                                            <SelectContent>{daysOfWeek.map(day => <SelectItem key={day.value} value={day.value.toString()}>{day.label}</SelectItem>)}</SelectContent>
                                        </Select>
                                        <Input type="time" value={block.start_time ?? ''} onChange={(e) => handleUnavailabilityChange(index, 'start_time', e.target.value)} />
                                        <Input type="time" value={block.end_time ?? ''} onChange={(e) => handleUnavailabilityChange(index, 'end_time', e.target.value)} />
                                        <Input placeholder="Reason (e.g., Maintenance)" value={block.reason || ''} onChange={(e) => handleUnavailabilityChange(index, 'reason', e.target.value)} />
                                        <Button type="button" variant="ghost" size="icon" className="justify-self-end" onClick={() => handleRemoveUnavailability(index)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                    </div>
                                ))}
                                <Button type="button" variant="outline" size="sm" className="h-auto py-1.5" onClick={handleAddUnavailability}><Plus className="mr-2 h-4 w-4" /> Add Unavailability</Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Advanced Booking Rules */}
                    <Card id="advanced-rules" className="scroll-mt-24">
                         <CardHeader>
                            <CardTitle>Advanced Booking Rules</CardTitle>
                            <CardDescription>Set specific constraints for how and when users can book this court.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="booking_window">Booking Window (Days)</Label>
                                    <Input id="booking_window" name="booking_window" type="number" defaultValue={court?.booking_window ?? 1} placeholder="e.g., 2" />
                                    <p className="text-xs text-muted-foreground">How many days in advance can a user book? (e.g., 1 means today only, 2 means today and tomorrow).</p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="booking_style">Booking Style</Label>
                                    <Select name="booking_style" defaultValue={court?.booking_style ?? 'calendar'}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="calendar">Calendar</SelectItem>
                                            <SelectItem value="rolling_window">Rolling Window</SelectItem>
                                        </SelectContent>
                                    </Select>
                                     <p className="text-xs text-muted-foreground">Choose how booking availability is presented to users.</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="slot_duration">Slot Duration (Minutes)</Label>
                                <Select name="slot_duration" defaultValue={court?.slot_duration?.toString() ?? '60'}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="30">30 minutes</SelectItem>
                                        <SelectItem value="60">60 minutes</SelectItem>
                                        <SelectItem value="90">90 minutes</SelectItem>
                                        <SelectItem value="120">120 minutes</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">Define the length of a single booking slot.</p>
                            </div>
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-1">
                                    <Label htmlFor="one_booking_per_user_per_day" className="text-base font-medium">One Booking Per Day</Label>
                                    <p className="text-xs text-muted-foreground">Limit users to one booking on this court per calendar day.</p>
                                </div>
                                <Switch id="one_booking_per_user_per_day" name="one_booking_per_user_per_day" checked={oneBookingPerDay} onCheckedChange={setOneBookingPerDay} />
                            </div>
                             <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-1">
                                    <Label htmlFor="is_booking_rolling" className="text-base font-medium">Rolling 24-Hour Window</Label>
                                    <p className="text-xs text-muted-foreground">Users can only book a slot if it's within 24 hours of the current time.</p>
                                </div>
                                <Switch id="is_booking_rolling" name="is_booking_rolling" checked={isBookingRolling} onCheckedChange={setIsBookingRolling} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Images & Pricing Section */}
                    <Card id="images-pricing" className="scroll-mt-24">
                        <CardHeader>
                            <CardTitle>Images &amp; Pricing</CardTitle>
                            <CardDescription>Manage court images (max 2MB each), pricing, and other metadata.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Main Image */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label>Main Image</Label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            ref={mainImageRef}
                                            name="main_image_file"
                                            className="hidden"
                                            onChange={e => {
                                                const f = e.target.files?.[0];
                                                if (f) {
                                                    setMainImagePreview(URL.createObjectURL(f));
                                                }
                                            }}
                                        />
                                        <Button type="button" variant="outline" size="sm" className="h-auto py-1.5" onClick={() => mainImageRef.current?.click()}>
                                            <ImagePlus className="mr-2 h-4 w-4" /> Upload Image
                                        </Button>
                                    </div>
                                    {mainImagePreview && (
                                        <button
                                            type="button"
                                            className="mt-3 block w-full max-w-sm rounded-md overflow-hidden cursor-pointer"
                                            onClick={() => setImageInPreview(mainImagePreview)}
                                        >
                                            <Image
                                                src={mainImagePreview}
                                                alt="Main Court Preview"
                                                width={600}
                                                height={400}
                                                className="w-full h-auto object-cover"
                                            />
                                        </button>
                                    )}
                                </div>

                                {/* Cover Image */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label>Cover Image</Label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            ref={coverImageRef}
                                            name="cover_image_file"
                                            className="hidden"
                                            onChange={e => {
                                                const f = e.target.files?.[0];
                                                if (f) {
                                                    setCoverImagePreview(URL.createObjectURL(f));
                                                }
                                            }}
                                        />
                                        <Button type="button" variant="outline" size="sm" className="h-auto py-1.5" onClick={() => coverImageRef.current?.click()}>
                                            <ImagePlus className="mr-2 h-4 w-4" /> Upload Image
                                        </Button>
                                    </div>
                                    {coverImagePreview && (
                                        <button
                                            type="button"
                                            className="mt-3 block w-full max-w-sm rounded-md overflow-hidden cursor-pointer"
                                            onClick={() => setImageInPreview(coverImagePreview)}
                                        >
                                            <Image
                                                src={coverImagePreview}
                                                alt="Cover Court Preview"
                                                width={600}
                                                height={400}
                                                className="w-full h-auto object-cover"
                                            />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2"><Label htmlFor="price">Base Price (per hour)</Label><div className="flex items-center gap-2"><span className="text-lg font-semibold">₹</span><Input id="price" name="price" type="number" defaultValue={court?.price ?? undefined} className="w-32" /></div></div>
                                <div className="space-y-2"><Label htmlFor="discount">Discount (%)</Label><div className="flex items-center gap-2"><Input id="discount" name="discount" type="number" defaultValue={court?.discount ?? undefined} placeholder="e.g. 10" className="w-24" /><span className="text-muted-foreground">%</span></div></div>
                            </div>
                            <div className="space-y-2"><Label htmlFor="badge_type">Badge Text</Label><Input id="badge_type" name="badge_type" defaultValue={court?.badge_type || ''} placeholder="e.g., 'New', 'Popular', 'Featured'" /></div>
                        </CardContent>
                    </Card>

                    {/* Rules Section */}
                    <Card id="court-rules" className="scroll-mt-24">
                        <CardHeader><CardTitle>Court Rules</CardTitle><CardDescription>Define the rules for using this court.</CardDescription></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                {rules.map((rule, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <Input value={rule.rule || ''} onChange={(e) => handleRuleChange(index, e.target.value)} placeholder={`Rule #${index + 1}`} />
                                        <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveRule(index)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                    </div>
                                ))}
                            </div>
                            <Button type="button" variant="outline" size="sm" className="h-auto py-1.5" onClick={handleAddRule}><Plus className="mr-2 h-4 w-4" /> Add Rule</Button>
                        </CardContent>
                    </Card>

                    {/* Contact Section */}
                    <Card id="contact-info" className="scroll-mt-24">
                        <CardHeader><CardTitle>Contact Information</CardTitle><CardDescription>Provide contact details for the court.</CardDescription></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2"><Label htmlFor="contact_phone">Phone Number</Label><Input id="contact_phone" value={contact.phone || ''} onChange={(e) => setContact({...contact, phone: e.target.value})}/></div>
                                <div className="space-y-2"><Label htmlFor="contact_email">Email Address</Label><Input id="contact_email" type="email" value={contact.email || ''} onChange={(e) => setContact({...contact, email: e.target.value})}/></div>
                            </div>
                        </CardContent>
                    </Card>

                    <Separator />
                    
                    <div className="flex items-center justify-end gap-2 sticky bottom-0 bg-background py-4">
                        <Button variant="outline" type="button" asChild><Link href="/super-admin/courts">Cancel</Link></Button>
                        <Button type="submit">Save Changes</Button>
                    </div>
                </form>

                {/* Gallery Section */}
                {!isAdding && court && (
                    <Card id="court-gallery-section" className="scroll-mt-24">
                        <CardHeader>
                            <CardTitle>Court Gallery</CardTitle>
                            <CardDescription>Upload multiple images for the court gallery. These will be visible to users.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <form ref={galleryFormRef} onSubmit={onGalleryFormSubmit} className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center">
                                 <input type="hidden" name="court_id" value={court.id} />
                                 <Label htmlFor="gallery-images" className="mb-4 cursor-pointer">
                                    <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                                    <span className="mt-2 block font-semibold text-primary">Click to upload or drag & drop</span>
                                    <span className="mt-1 block text-sm text-muted-foreground">Images only, max 2MB each</span>
                                 </Label>
                                 <Input
                                    id="gallery-images"
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
                            
                            {court.court_gallery && court.court_gallery.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {court.court_gallery.map((image) => (
                                        <div key={image.id} className="relative group">
                                            <Image
                                                src={image.image_url}
                                                alt={`Court gallery image ${image.id}`}
                                                width={300}
                                                height={200}
                                                className="rounded-md object-cover w-full aspect-video"
                                            />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                                 <form action={deleteCourtGalleryImage}>
                                                    <input type="hidden" name="court_id" value={court.id} />
                                                    <input type="hidden" name="image_id" value={image.id} />
                                                    <input type="hidden" name="image_url" value={image.image_url} />
                                                    <DeleteButton />
                                                </form>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center">No gallery images have been uploaded for this court.</p>
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
        </div>
    );
}
