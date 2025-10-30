
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { addCourt, updateCourt, addCourtGalleryImages, deleteCourtGalleryImage } from '@/app/super-admin/courts/[id]/actions';
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
        }
        
        const result = await action(formData);

        if (result?.error) {
            toast({ variant: "destructive", title: "Error", description: result.error });
        } else {
            toast({ title: "Success", description: `Court ${isAdding ? 'added' : 'updated'} successfully.` });
            router.push('/arena/courts');
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
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setPreview: (url: string) => void) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                toast({
                    variant: 'destructive',
                    title: 'File Too Large',
                    description: 'The image cannot exceed 2MB.',
                });
                e.target.value = ''; // Reset the input
                return;
            }
            setPreview(URL.createObjectURL(file));
        }
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
                            <Button variant="outline" type="button" asChild className="flex-1 sm:flex-initial"><Link href="/arena/courts">Cancel</Link></Button>
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
                                    <Select name="organisation_id" defaultValue={court?.organisation_id?.toString() || ''} required>
                                        <SelectTrigger><SelectValue placeholder="Select venue" /></SelectTrigger>
                                        <SelectContent>{organisations.map(org => <SelectItem key={org.id} value={org.id.toString()}>{org.name}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2"><Label htmlFor="address">Address</Label><Input id="address" name="address" defaultValue={court?.address || ''} placeholder="Court address" required/></div>
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

                    <Separator />
                    
                    <div className="flex items-center justify-end gap-2 sticky bottom-0 bg-background py-4">
                        <Button variant="outline" type="button" asChild><Link href="/arena/courts">Cancel</Link></Button>
                        <Button type="submit">Save Changes</Button>
                    </div>
                </form>
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
