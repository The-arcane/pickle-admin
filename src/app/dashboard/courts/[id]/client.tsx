'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { addCourt, updateCourt } from '../actions';
import type { Court, Organisation, Sport } from './types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Car, Coffee, Droplet, Bath, Plus } from 'lucide-react';

const courtTypeOptions = ['Indoor', 'VIP', 'Night Lights', 'Outdoor'];
const tagOptions = ['Indoor', 'VIP', 'Night Lights', 'Outdoor'];
const facilityOptions = [
    { id: 'Water', label: 'Water', icon: Droplet },
    { id: 'Restrooms', label: 'Restrooms', icon: Bath },
    { id: 'Cafe', label: 'Cafe', icon: Coffee },
    { id: 'Parking', label: 'Car Parking', icon: Car },
];

export function EditCourtClientPage({ court, organisations, sports }: { court: Court | null, organisations: Organisation[], sports: Sport[] }) {
    const router = useRouter();
    const { toast } = useToast();
    const isAdding = !court;
    
    // Form State
    const [courtName, setCourtName] = useState(court?.name || '');
    const [organisationId, setOrganisationId] = useState(court?.organisation_id?.toString() || '');
    const [address, setAddress] = useState(court?.venue_address || '');
    const [sportId, setSportId] = useState(court?.sport_id?.toString() || '');
    const [maxPlayers, setMaxPlayers] = useState(court?.max_players || 4);
    const [audienceCapacity, setAudienceCapacity] = useState(court?.audience_capacity || 7850);
    const [description, setDescription] = useState(court?.description || '');
    const [equipmentRental, setEquipmentRental] = useState(court?.equipment_rental || false);
    const [selectedCourtTypes, setSelectedCourtTypes] = useState<string[]>(court?.court_type || ['Indoor']);
    const [selectedTags, setSelectedTags] = useState<string[]>(court?.tags || ['Indoor']);
    const [labels, setLabels] = useState(court?.labels || ['Label', 'Label', 'Label', 'Label']);
    const [selectedFacilities, setSelectedFacilities] = useState<string[]>(court?.facilities || ['Water', 'Restrooms']);

    useEffect(() => {
        const selectedOrg = organisations.find(o => o.id.toString() === organisationId);
        setAddress(selectedOrg?.address || '');
    }, [organisationId, organisations]);

    const handleFormAction = async (formData: FormData) => {
        const action = isAdding ? addCourt : updateCourt;
        if (!isAdding && court) {
            formData.append('id', court.id.toString());
        }
        // Note: For now, we are not appending the array/boolean values to formData
        // as the backend actions are not yet set up to receive them.
        // This can be added later when the DB schema and actions are updated.
        const result = await action(formData);
        if (result?.error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: result.error,
            });
        }
    };
    
    const toggleSelection = (option: string, list: string[], setter: React.Dispatch<React.SetStateAction<string[]>>) => {
        if (list.includes(option)) {
            setter(list.filter(item => item !== option));
        } else {
            setter([...list, option]);
        }
    };

    return (
        <Tabs defaultValue="court-info" orientation="vertical" className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>Customize</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <TabsList className="grid w-full grid-cols-1 h-auto bg-transparent p-0">
                                <TabsTrigger value="court-info" className="justify-start data-[state=active]:bg-muted data-[state=active]:text-primary data-[state=active]:font-semibold">Court Info</TabsTrigger>
                                <TabsTrigger value="availability" className="justify-start data-[state=active]:bg-muted data-[state=active]:text-primary data-[state=active]:font-semibold">Availability</TabsTrigger>
                                <TabsTrigger value="booking-rules" className="justify-start data-[state=active]:bg-muted data-[state=active]:text-primary data-[state=active]:font-semibold">Booking Rules</TabsTrigger>
                                <TabsTrigger value="pricing" className="justify-start data-[state=active]:bg-muted data-[state=active]:text-primary data-[state=active]:font-semibold">Pricing & Add-ons</TabsTrigger>
                                <TabsTrigger value="visibility" className="justify-start data-[state=active]:bg-muted data-[state=active]:text-primary data-[state=active]:font-semibold">Visibility & Settings</TabsTrigger>
                            </TabsList>
                        </CardContent>
                    </Card>
                </div>
                
                <div className="md:col-span-3">
                    <form action={handleFormAction}>
                        <TabsContent value="court-info" className="mt-0">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Court Info</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-8">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Court Name</Label>
                                        <Input id="name" name="name" value={courtName} onChange={e => setCourtName(e.target.value)} placeholder="e.g., Court A" />
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="organisation_id">Venue Name</Label>
                                            <Select name="organisation_id" value={organisationId} onValueChange={setOrganisationId}>
                                                <SelectTrigger><SelectValue placeholder="Select venue" /></SelectTrigger>
                                                <SelectContent>
                                                    {organisations.map(org => <SelectItem key={org.id} value={org.id.toString()}>{org.name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="address">Address</Label>
                                            <Input id="address" name="address" value={address} readOnly placeholder="Venue address"/>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="sport_id">Sports Type</Label>
                                        <Select name="sport_id" value={sportId} onValueChange={setSportId}>
                                            <SelectTrigger><SelectValue placeholder="Select sport" /></SelectTrigger>
                                            <SelectContent>
                                                {sports.map(sport => <SelectItem key={sport.id} value={sport.id.toString()}>{sport.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Court Type</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {courtTypeOptions.map(type => (
                                                <Button key={type} type="button" variant={selectedCourtTypes.includes(type) ? 'default' : 'outline'} onClick={() => toggleSelection(type, selectedCourtTypes, setSelectedCourtTypes)}>{type}</Button>
                                            ))}
                                            <Button type="button" variant="outline" size="icon"><Plus className="h-4 w-4"/></Button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="max_players">Max Players</Label>
                                            <Input id="max_players" name="max_players" type="number" value={maxPlayers} onChange={e => setMaxPlayers(Number(e.target.value))} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="audience_capacity">Audience Capacity</Label>
                                            <Input id="audience_capacity" name="audience_capacity" type="number" value={audienceCapacity} onChange={e => setAudienceCapacity(Number(e.target.value))} />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Tags</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {tagOptions.map(tag => (
                                                <Button key={tag} type="button" variant={selectedTags.includes(tag) ? 'default' : 'outline'} onClick={() => toggleSelection(tag, selectedTags, setSelectedTags)}>{tag}</Button>
                                            ))}
                                            <Button type="button" variant="outline" size="icon"><Plus className="h-4 w-4"/></Button>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between rounded-lg border p-4">
                                        <Label htmlFor="equipment_rental" className="text-base font-medium">Equipment Rental Available</Label>
                                        <Switch id="equipment_rental" checked={equipmentRental} onCheckedChange={setEquipmentRental}/>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Court Description/Overview</Label>
                                        <Textarea id="description" name="description" value={description} onChange={e => setDescription(e.target.value)} rows={4}/>
                                    </div>

                                    <div className="space-y-4">
                                        <Label>More Info</Label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {labels.map((label, index) => (
                                                <div key={index} className="space-y-1">
                                                    <Input value={label} readOnly />
                                                </div>
                                            ))}
                                        </div>
                                        <Button type="button" variant="outline" className="w-full">
                                            <Plus className="mr-2 h-4 w-4" /> Add New
                                        </Button>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <Label>Facility</Label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {facilityOptions.map(facility => (
                                                <div key={facility.id} className="flex items-center gap-2">
                                                    <Checkbox id={facility.id} checked={selectedFacilities.includes(facility.id)} onCheckedChange={(checked) => {
                                                        const list = checked ? [...selectedFacilities, facility.id] : selectedFacilities.filter(f => f !== facility.id);
                                                        setSelectedFacilities(list);
                                                    }} />
                                                    <facility.icon className="h-4 w-4 text-muted-foreground" />
                                                    <Label htmlFor={facility.id} className="text-sm font-normal">{facility.label}</Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="availability" className="mt-0">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Availability</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p>Define when the court is open for bookings. This feature is coming soon.</p>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="booking-rules" className="mt-0">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Booking Rules</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p>Set rules for advance bookings, cancellations, etc. This feature is coming soon.</p>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="pricing" className="mt-0">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Pricing &amp; Add-ons</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p>Manage court pricing and optional add-ons. This feature is coming soon.</p>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="visibility" className="mt-0">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Visibility &amp; Settings</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p>Control who can see and book this court. This feature is coming soon.</p>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <div className="flex items-center justify-end gap-2 mt-8">
                            <Link href="/dashboard/courts" passHref>
                                <Button variant="outline" type="button">Cancel</Button>
                            </Link>
                            <Button type="submit">Save</Button>
                        </div>
                    </form>
                </div>
            </div>
        </Tabs>
    );
}
