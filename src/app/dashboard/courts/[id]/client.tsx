'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { addCourt, updateCourt } from '../actions';
import type { Court, Organisation, Sport, CourtRule, CourtGalleryImage, CourtContact, AvailabilityBlock, RecurringUnavailability } from './types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Lightbulb, Plus, Trash2, ImagePlus, X } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export function EditCourtClientPage({ court, organisations, sports }: { court: Court | null, organisations: Organisation[], sports: Sport[] }) {
    const router = useRouter();
    const { toast } = useToast();
    const isAdding = !court;
    
    // Form State
    const [equipmentRental, setEquipmentRental] = useState(court?.is_equipment_available ?? false);
    const [floodlights, setFloodlights] = useState(court?.has_floodlights ?? false);
    
    // State for related tables
    const [rules, setRules] = useState<Partial<CourtRule>[]>(court?.court_rules ?? [{ rule: '' }]);
    const [gallery, setGallery] = useState<Partial<CourtGalleryImage>[]>(court?.court_gallery ?? []);
    const [contact, setContact] = useState<Partial<CourtContact>>(court?.court_contacts?.[0] ?? {});
    const [newImageUrl, setNewImageUrl] = useState('');
    const [availability, setAvailability] = useState<Partial<AvailabilityBlock>[]>(court?.availability_blocks ?? []);
    const [unavailability, setUnavailability] = useState<Partial<RecurringUnavailability>[]>(court?.recurring_unavailability ?? []);

    const handleFormAction = async (formData: FormData) => {
        formData.append('is_equipment_available', String(equipmentRental));
        formData.append('has_floodlights', String(floodlights));
        formData.append('rules', JSON.stringify(rules.filter(r => r.rule && r.rule.trim() !== '')));
        formData.append('gallery', JSON.stringify(gallery));
        formData.append('contact', JSON.stringify(contact));
        formData.append('availability', JSON.stringify(availability.filter(a => a.day_of_week && a.start_time && a.end_time)));
        formData.append('unavailability', JSON.stringify(unavailability.filter(u => u.day_of_week && u.start_time && u.end_time)));


        const action = isAdding ? addCourt : updateCourt;
        if (!isAdding && court) {
            formData.append('id', court.id.toString());
        }
        
        const result = await action(formData);

        if (result?.error) {
            toast({ variant: "destructive", title: "Error", description: result.error });
        } else {
            toast({ title: "Success", description: `Court ${isAdding ? 'added' : 'updated'} successfully.` });
            router.push('/dashboard/courts');
            router.refresh();
        }
    };
    
    const handleAddRule = () => setRules([...rules, { rule: '' }]);
    const handleRemoveRule = (index: number) => setRules(rules.filter((_, i) => i !== index));
    const handleRuleChange = (index: number, value: string) => {
        const newRules = [...rules];
        newRules[index].rule = value;
        setRules(newRules);
    };

    const handleAddImage = () => {
        if (newImageUrl.trim()) {
            setGallery([...gallery, { image_url: newImageUrl.trim() }]);
            setNewImageUrl('');
        }
    };
    const handleRemoveImage = (index: number) => setGallery(gallery.filter((_, i) => i !== index));

    const handleAddAvailability = () => setAvailability([...availability, { day_of_week: 'Monday', start_time: '09:00', end_time: '17:00' }]);
    const handleRemoveAvailability = (index: number) => setAvailability(availability.filter((_, i) => i !== index));
    const handleAvailabilityChange = (index: number, field: keyof AvailabilityBlock, value: string) => {
        const newAvailability = [...availability];
        (newAvailability[index] as any)[field] = value;
        setAvailability(newAvailability);
    };

    const handleAddUnavailability = () => setUnavailability([...unavailability, { day_of_week: 'Monday', start_time: '12:00', end_time: '13:00', reason: '' }]);
    const handleRemoveUnavailability = (index: number) => setUnavailability(unavailability.filter((_, i) => i !== index));
    const handleUnavailabilityChange = (index: number, field: keyof RecurringUnavailability, value: string) => {
        const newUnavailability = [...unavailability];
        (newUnavailability[index] as any)[field] = value;
        setUnavailability(newUnavailability);
    };

    const daysOfWeek: AvailabilityBlock['day_of_week'][] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];


    return (
        <form action={handleFormAction} className="space-y-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">{isAdding ? 'Add New Court' : 'Edit Court'}</h1>
                 <div className="flex items-center gap-2">
                    <Button variant="outline" type="button" asChild><Link href="/dashboard/courts">Cancel</Link></Button>
                    <Button type="submit">Save Changes</Button>
                </div>
            </div>

            {/* Court Info Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Court Info</CardTitle>
                    <CardDescription>Basic details about the court.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2"><Label htmlFor="name">Court Name</Label><Input id="name" name="name" defaultValue={court?.name || ''} placeholder="e.g., Court A" required/></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2"><Label htmlFor="organisation_id">Venue Name</Label><Select name="organisation_id" defaultValue={court?.organisation_id?.toString() || ''} required><SelectTrigger><SelectValue placeholder="Select venue" /></SelectTrigger><SelectContent>{organisations.map(org => <SelectItem key={org.id} value={org.id.toString()}>{org.name}</SelectItem>)}</SelectContent></Select></div>
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
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center justify-between rounded-lg border p-4"><Label htmlFor="has_floodlights" className="text-base font-medium flex items-center gap-2"><Lightbulb className="h-4 w-4"/> Floodlights Available</Label><Switch id="has_floodlights" name="has_floodlights" checked={floodlights} onCheckedChange={setFloodlights}/></div>
                        <div className="flex items-center justify-between rounded-lg border p-4"><Label htmlFor="is_equipment_available" className="text-base font-medium">Equipment Rental Available</Label><Switch id="is_equipment_available" name="is_equipment_available" checked={equipmentRental} onCheckedChange={setEquipmentRental}/></div>
                    </div>
                </CardContent>
            </Card>

            {/* Availability Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Court Availability</CardTitle>
                    <CardDescription>Set the general business hours and weekly availability for this court.</CardDescription>
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
                        <Label className="text-base font-medium">Weekly Availability Blocks</Label>
                        {availability.map((block, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-4 items-center gap-2 p-2 border rounded-md">
                                <Select value={block.day_of_week} onValueChange={(val) => handleAvailabilityChange(index, 'day_of_week', val as any)}>
                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                    <SelectContent>{daysOfWeek.map(day => <SelectItem key={day} value={day}>{day}</SelectItem>)}</SelectContent>
                                </Select>
                                <Input type="time" value={block.start_time} onChange={(e) => handleAvailabilityChange(index, 'start_time', e.target.value)} />
                                <Input type="time" value={block.end_time} onChange={(e) => handleAvailabilityChange(index, 'end_time', e.target.value)} />
                                <Button type="button" variant="ghost" size="icon" className="justify-self-end" onClick={() => handleRemoveAvailability(index)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                            </div>
                        ))}
                        <Button type="button" variant="outline" onClick={handleAddAvailability}><Plus className="mr-2 h-4 w-4" /> Add Availability</Button>
                    </div>
                    <Separator />
                    <div className="space-y-4">
                        <Label className="text-base font-medium">Recurring Unavailability</Label>
                         {unavailability.map((block, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-5 items-center gap-2 p-2 border rounded-md">
                                <Select value={block.day_of_week} onValueChange={(val) => handleUnavailabilityChange(index, 'day_of_week', val as any)}>
                                     <SelectTrigger><SelectValue/></SelectTrigger>
                                    <SelectContent>{daysOfWeek.map(day => <SelectItem key={day} value={day}>{day}</SelectItem>)}</SelectContent>
                                </Select>
                                <Input type="time" value={block.start_time} onChange={(e) => handleUnavailabilityChange(index, 'start_time', e.target.value)} />
                                <Input type="time" value={block.end_time} onChange={(e) => handleUnavailabilityChange(index, 'end_time', e.target.value)} />
                                <Input className="md:col-span-2" placeholder="Reason (e.g., Maintenance)" value={block.reason || ''} onChange={(e) => handleUnavailabilityChange(index, 'reason', e.target.value)} />
                                <Button type="button" variant="ghost" size="icon" className="md:col-start-6 justify-self-end" onClick={() => handleRemoveUnavailability(index)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                            </div>
                        ))}
                        <Button type="button" variant="outline" onClick={handleAddUnavailability}><Plus className="mr-2 h-4 w-4" /> Add Unavailability</Button>
                    </div>
                </CardContent>
            </Card>

            {/* Images & Pricing Section */}
            <Card>
                <CardHeader><CardTitle>Images &amp; Pricing</CardTitle><CardDescription>Manage court images, pricing, and other metadata.</CardDescription></CardHeader>
                <CardContent className="space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-2"><Label htmlFor="image">Main Image URL</Label><Input id="image" name="image" defaultValue={court?.image || ''} placeholder="URL for the court's main image" /></div>
                        <div className="space-y-2"><Label htmlFor="cover_image">Cover Image URL</Label><Input id="cover_image" name="cover_image" defaultValue={court?.cover_image || ''} placeholder="URL for the court's cover image" /></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2"><Label htmlFor="price">Base Price (per hour)</Label><div className="flex items-center gap-2"><span className="text-lg font-semibold">₹</span><Input id="price" name="price" type="number" defaultValue={court?.price ?? undefined} className="w-32" /></div></div>
                        <div className="space-y-2"><Label htmlFor="discount">Discount (%)</Label><div className="flex items-center gap-2"><Input id="discount" name="discount" type="number" defaultValue={court?.discount ?? undefined} placeholder="e.g. 10" className="w-24" /><span className="text-muted-foreground">%</span></div></div>
                    </div>
                     <div className="space-y-2"><Label htmlFor="badge_type">Badge Text</Label><Input id="badge_type" name="badge_type" defaultValue={court?.badge_type || ''} placeholder="e.g., 'New', 'Popular', 'Featured'" /></div>
                </CardContent>
            </Card>
            
            {/* Gallery Section */}
            <Card>
                <CardHeader><CardTitle>Court Gallery</CardTitle><CardDescription>Add or remove images from the court's gallery.</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {gallery.map((img, index) => (
                            <div key={index} className="relative group aspect-video">
                                <Image src={img.image_url || 'https://placehold.co/300x200.png'} alt={`Court image ${index + 1}`} layout="fill" className="rounded-md object-cover"/>
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

            {/* Rules Section */}
            <Card>
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
                    <Button type="button" variant="outline" onClick={handleAddRule}><Plus className="mr-2 h-4 w-4" /> Add Rule</Button>
                </CardContent>
            </Card>

             {/* Contact Section */}
            <Card>
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
                <Button variant="outline" type="button" asChild><Link href="/dashboard/courts">Cancel</Link></Button>
                <Button type="submit">Save Changes</Button>
            </div>
        </form>
    );
}
