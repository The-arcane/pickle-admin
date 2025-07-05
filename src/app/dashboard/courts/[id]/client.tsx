'use client';

import { useState } from 'react';
import Link from 'next/link';
import { addCourt, updateCourt } from '../actions';
import type { Court, Organisation, Sport } from './types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Car, Coffee, Droplet, Bath, Plus, Lightbulb } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';

const facilityOptions = [
    { id: 'Water', label: 'Water', icon: Droplet },
    { id: 'Restrooms', label: 'Restrooms', icon: Bath },
    { id: 'Cafe', label: 'Cafe', icon: Coffee },
    { id: 'Parking', label: 'Car Parking', icon: Car },
];

export function EditCourtClientPage({ court, organisations, sports }: { court: Court | null, organisations: Organisation[], sports: Sport[] }) {
    const { toast } = useToast();
    const isAdding = !court;
    
    // Form State
    const [equipmentRental, setEquipmentRental] = useState(court?.is_equipment_available ?? false);
    const [floodlights, setFloodlights] = useState(court?.has_floodlights ?? false);
    
    // For now, amenities are not loaded from the DB. This state is here for UI purposes.
    const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
    
    const [blackoutDates, setBlackoutDates] = useState<Date[] | undefined>(undefined);


    const handleFormAction = async (formData: FormData) => {
        // Manually append switch states to FormData
        formData.append('is_equipment_available', String(equipmentRental));
        formData.append('has_floodlights', String(floodlights));
        // Note: Saving amenities and other related table data is complex and not implemented in this action.
        // It would require inserts/deletes on tables like court_amenities, court_rules etc.

        const action = isAdding ? addCourt : updateCourt;
        if (!isAdding && court) {
            formData.append('id', court.id.toString());
        }
        
        const result = await action(formData);
        if (result?.error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: result.error,
            });
        }
    };

    return (
        <form action={handleFormAction} className="space-y-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold">{isAdding ? 'Add New Court' : 'Edit Court'}</h1>

            {/* Court Info Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Court Info</CardTitle>
                    <CardDescription>Basic details about the court.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    <div className="space-y-2">
                        <Label htmlFor="name">Court Name</Label>
                        <Input id="name" name="name" defaultValue={court?.name || ''} placeholder="e.g., Court A" />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="organisation_id">Venue Name</Label>
                            <Select name="organisation_id" defaultValue={court?.organisation_id?.toString() || ''}>
                                <SelectTrigger><SelectValue placeholder="Select venue" /></SelectTrigger>
                                <SelectContent>
                                    {organisations.map(org => <SelectItem key={org.id} value={org.id.toString()}>{org.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Input id="address" name="address" defaultValue={court?.address || ''} placeholder="Court address"/>
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="sport_id">Sports Type</Label>
                        <Select name="sport_id" defaultValue={court?.sport_id?.toString() || ''}>
                            <SelectTrigger><SelectValue placeholder="Select sport" /></SelectTrigger>
                            <SelectContent>
                                {sports.map(sport => <SelectItem key={sport.id} value={sport.id.toString()}>{sport.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Court Description/Overview</Label>
                        <Textarea id="description" name="description" defaultValue={court?.description || ''} rows={4}/>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="surface">Court Surface</Label>
                            <Input id="surface" name="surface" defaultValue={court?.surface || ''} placeholder="e.g., Hard, Clay, Grass"/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="feature">Feature</Label>
                            <Input id="feature" name="feature" defaultValue={court?.feature || ''} placeholder="e.g., 'Indoor', 'Premiere Court'" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="max_players">Max Players</Label>
                            <Input id="max_players" name="max_players" type="number" defaultValue={court?.max_players ?? undefined} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="audience_capacity">Audience Capacity</Label>
                            <Input id="audience_capacity" name="audience_capacity" type="number" defaultValue={court?.audience_capacity ?? undefined} />
                        </div>
                    </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <Label htmlFor="has_floodlights" className="text-base font-medium flex items-center gap-2"><Lightbulb className="h-4 w-4"/> Floodlights Available</Label>
                            <Switch id="has_floodlights" name="has_floodlights" checked={floodlights} onCheckedChange={setFloodlights}/>
                        </div>
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <Label htmlFor="is_equipment_available" className="text-base font-medium">Equipment Rental Available</Label>
                            <Switch id="is_equipment_available" name="is_equipment_available" checked={equipmentRental} onCheckedChange={setEquipmentRental}/>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-2">
                            <Label htmlFor="image">Image URL</Label>
                            <Input id="image" name="image" defaultValue={court?.image || ''} placeholder="URL for the court's main image" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cover_image">Cover Image URL</Label>
                            <Input id="cover_image" name="cover_image" defaultValue={court?.cover_image || ''} placeholder="URL for the court's cover image" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="badge_type">Badge Text</Label>
                        <Input id="badge_type" name="badge_type" defaultValue={court?.badge_type || ''} placeholder="e.g., 'New', 'Popular', 'Featured'" />
                    </div>

                    <div className="space-y-4">
                        <Label>Facility (UI Only - Not Saved)</Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {facilityOptions.map(facility => (
                                <div key={facility.id} className="flex items-center gap-2">
                                    <Checkbox 
                                        id={facility.id}
                                        checked={selectedFacilities.includes(facility.id)}
                                        onCheckedChange={(checked) => {
                                            const list = checked ? [...selectedFacilities, facility.id] : selectedFacilities.filter(f => f !== facility.id);
                                            setSelectedFacilities(list);
                                        }}
                                    />
                                    <facility.icon className="h-4 w-4 text-muted-foreground" />
                                    <Label htmlFor={facility.id} className="text-sm font-normal">{facility.label}</Label>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Availability Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Availability</CardTitle>
                    <CardDescription>Define when the court is open for bookings. (UI Only - Not Saved)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    <div className="space-y-4">
                        <Label className="text-base font-medium">Operating Hours</Label>
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                            <div key={day} className="flex items-center gap-4">
                                <Checkbox id={`day-${day}`} name={`operating_day_${day.toLowerCase()}`} defaultChecked/>
                                <Label htmlFor={`day-${day}`} className="w-24">{day}</Label>
                                <div className="flex items-center gap-2">
                                    <Input type="time" name={`operating_start_${day.toLowerCase()}`} defaultValue="09:00" className="w-auto"/>
                                    <span>-</span>
                                    <Input type="time" name={`operating_end_${day.toLowerCase()}`} defaultValue="21:00" className="w-auto"/>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Separator />
                    <div className="space-y-4">
                        <Label className="text-base font-medium">Blackout Dates</Label>
                        <p className="text-sm text-muted-foreground">Select dates when the court is unavailable for booking.</p>
                        <Calendar mode="multiple" selected={blackoutDates} onSelect={setBlackoutDates} className="rounded-md border"/>
                    </div>
                </CardContent>
            </Card>

            {/* Booking Rules Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Booking Rules</CardTitle>
                    <CardDescription>Set rules for advance bookings, cancellations, and more. (UI Only - Not Saved)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="min-lead-time">Minimum Lead Time</Label>
                            <div className="flex gap-2">
                                <Input id="min-lead-time" name="min_lead_time_value" type="number" defaultValue="2" className="w-24"/>
                                <Select name="min_lead_time_unit" defaultValue="hours">
                                    <SelectTrigger className="w-[120px]"><SelectValue/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="hours">Hours</SelectItem>
                                        <SelectItem value="days">Days</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <p className="text-xs text-muted-foreground">How far in advance can users book?</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="max-lead-time">Maximum Lead Time</Label>
                            <div className="flex gap-2">
                                <Input id="max-lead-time" name="max_lead_time_value" type="number" defaultValue="30" className="w-24"/>
                                <Select name="max_lead_time_unit" defaultValue="days">
                                    <SelectTrigger className="w-[120px]"><SelectValue/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="days">Days</SelectItem>
                                        <SelectItem value="months">Months</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <p className="text-xs text-muted-foreground">How far into the future can users book?</p>
                        </div>
                    </div>
                    <div className="space-y-4 rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="cancellation-policy-switch" className="text-base font-medium">Cancellation Policy</Label>
                            <Switch name="cancellation_policy_enabled" id="cancellation-policy-switch" defaultChecked/>
                        </div>
                        <div className="space-y-4">
                            <Label>Allow cancellation up to</Label>
                            <div className="flex flex-wrap items-center gap-2">
                                <Input name="cancellation_window_value" type="number" defaultValue="24" className="w-24"/>
                                <Select name="cancellation_window_unit" defaultValue="hours">
                                    <SelectTrigger className="w-[120px]"><SelectValue/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="hours">Hours</SelectItem>
                                        <SelectItem value="days">Days</SelectItem>
                                    </SelectContent>
                                </Select>
                                <span>before booking time.</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Label>Cancellation Fee</Label>
                                <Input name="cancellation_fee_value" type="number" placeholder="Fee" className="w-24"/>
                                <Select name="cancellation_fee_type" defaultValue="percent">
                                    <SelectTrigger className="w-[120px]"><SelectValue/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="percent">%</SelectItem>
                                        <SelectItem value="fixed">Fixed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="min-booking-duration">Booking Duration (in minutes)</Label>
                            <div className="flex items-center gap-2">
                                <Input id="min-booking-duration" name="min_booking_duration" type="number" placeholder="Min" defaultValue="30" className="w-24"/>
                                <span>-</span>
                                <Input id="max-booking-duration" name="max_booking_duration" type="number" placeholder="Max" defaultValue="120" className="w-24"/>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
            
            {/* Pricing Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Pricing &amp; Add-ons</CardTitle>
                    <CardDescription>Manage court pricing and optional add-ons.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="price">Base Price (per hour)</Label>
                            <div className="flex items-center gap-2">
                                <span className="text-lg font-semibold">₹</span>
                                <Input id="price" name="price" type="number" defaultValue={court?.price ?? undefined} className="w-32" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="discount">Discount (%)</Label>
                             <div className="flex items-center gap-2">
                                <Input id="discount" name="discount" type="number" defaultValue={court?.discount ?? undefined} placeholder="e.g. 10" className="w-24" />
                                <span className="text-muted-foreground">%</span>
                            </div>
                        </div>
                    </div>
                    <Separator />
                    <div className="space-y-4">
                        <Label className="text-base font-medium">Add-ons (UI Only - Not Saved)</Label>
                        <div className="space-y-2 p-4 border rounded-lg">
                            <div className="flex items-center gap-4">
                                <Checkbox id="addon-racket" name="addon_racket_enabled" defaultChecked/>
                                <Label htmlFor="addon-racket" className="flex-1">Racket Rental</Label>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold">₹</span>
                                    <Input name="addon_racket_price" type="number" defaultValue="50" className="w-24"/>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Checkbox id="addon-balls" name="addon_balls_enabled" defaultChecked/>
                                <Label htmlFor="addon-balls" className="flex-1">Tennis Balls (can)</Label>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold">₹</span>
                                    <Input name="addon_balls_price" type="number" defaultValue="100" className="w-24"/>
                                </div>
                            </div>
                        </div>
                        <Button type="button" variant="outline">
                            <Plus className="mr-2 h-4 w-4" /> Add New Add-on
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Visibility Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Visibility &amp; Settings</CardTitle>
                    <CardDescription>Control who can see and book this court. (UI Only - Not Saved)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                     <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                            <Label htmlFor="public-visibility" className="text-base font-medium">Publicly Visible</Label>
                            <p className="text-sm text-muted-foreground">Make this court visible to everyone on your booking platform.</p>
                        </div>
                        <Switch id="public-visibility" name="publicly_visible" defaultChecked/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="who-can-book">Who can book?</Label>
                        <Select id="who-can-book" name="who_can_book" defaultValue="everyone">
                            <SelectTrigger className="w-[280px]"><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="everyone">Everyone</SelectItem>
                                <SelectItem value="members">Members Only</SelectItem>
                                <SelectItem value="specific-groups">Specific User Groups</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                            <Label htmlFor="require-approval" className="text-base font-medium">Require Booking Approval</Label>
                            <p className="text-sm text-muted-foreground">Manually approve bookings before they are confirmed.</p>
                        </div>
                        <Switch id="require-approval" name="require_approval"/>
                    </div>
                </CardContent>
            </Card>
            
            <div className="flex items-center justify-end gap-2 sticky bottom-0 bg-background py-4 border-t border-border">
                <Link href="/dashboard/courts" passHref>
                    <Button variant="outline" type="button">Cancel</Button>
                </Link>
                <Button type="submit">Save Changes</Button>
            </div>
        </form>
    );
}
