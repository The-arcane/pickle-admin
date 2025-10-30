
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export function EditCourtClientPage({ court, organisations, sports }: { court: Court | null, organisations: Organisation[], sports: Sport[] }) {
    const router = useRouter();
    const { toast } = useToast();
    const isAdding = !court;
    
    // Form State
    const [equipmentRental, setEquipmentRental] = useState(false);
    const [floodlights, setFloodlights] = useState(false);
    const [isPublic, setIsPublic] = useState(true);
    
    // Set state from props after initial render to avoid hydration mismatch
    useEffect(() => {
        if (court) {
            setEquipmentRental(court.is_equipment_available ?? false);
            setFloodlights(court.has_floodlights ?? false);
            setIsPublic(court.is_public ?? true);
        }
    }, [court]);

    const handleFormAction = async (formData: FormData) => {
        formData.append('is_equipment_available', String(equipmentRental));
        formData.append('has_floodlights', String(floodlights));
        formData.append('is_public', String(isPublic));
        
        // Remove complex fields not present in the simplified form
        formData.delete('rules');
        formData.delete('contact');
        formData.delete('availability');
        formData.delete('unavailability');
        formData.delete('one_booking_per_user_per_day');
        formData.delete('is_booking_rolling');


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

    return (
        <div className="w-full">
            <form action={handleFormAction} className="space-y-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <h1 className="text-3xl font-bold">{isAdding ? 'Add New Court' : 'Edit Court'}</h1>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button variant="outline" type="button" asChild className="flex-1 sm:flex-initial"><Link href="/arena/courts">Cancel</Link></Button>
                        <Button type="submit" className="flex-1 sm:flex-initial">Save Changes</Button>
                    </div>
                </div>

                {/* Court Info Section */}
                <Card id="court-info">
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
    );
}
