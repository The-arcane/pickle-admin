
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { addCoach, updateCoach } from '../actions';
import type { Coach, User, Sport, CoachSport, CoachPricing } from './types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, ImagePlus } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export function EditCoachClientPage({ coach, users, sports, organisationId }: { coach: Coach | null, users: User[], sports: Sport[], organisationId: number }) {
    const router = useRouter();
    const { toast } = useToast();
    const isAdding = !coach;

    // Form State
    const [userId, setUserId] = useState<string | undefined>(coach?.user_id?.toString());
    const [isIndependent, setIsIndependent] = useState(coach?.is_independent ?? true);
    const [selectedSports, setSelectedSports] = useState<Partial<CoachSport>[]>([]);
    const [pricing, setPricing] = useState<Partial<CoachPricing>[]>([]);
    const [profileImagePreview, setProfileImagePreview] = useState<string | null>(coach?.profile_image || null);
    
    useEffect(() => {
        if (coach) {
            setSelectedSports(coach.coach_sports.map(cs => ({ sport_id: cs.sport_id })) || []);
            setPricing(coach.coach_pricing || []);
        }
    }, [coach]);
    
    const handleFormAction = async (formData: FormData) => {
        formData.append('is_independent', String(isIndependent));
        formData.append('sports', JSON.stringify(selectedSports));
        formData.append('pricing', JSON.stringify(pricing));
        formData.append('organisation_id', organisationId.toString());

        const action = isAdding ? addCoach : updateCoach;
        if (!isAdding && coach) {
            formData.append('id', coach.id.toString());
        }

        const result = await action(formData);
        if (result?.error) {
            toast({ variant: "destructive", title: "Error", description: result.error });
        } else {
            toast({ title: "Success", description: `Coach ${isAdding ? 'added' : 'updated'} successfully.` });
            router.push('/dashboard/coaches');
        }
    };

    const handleSportSelect = (sportId: number) => {
        setSelectedSports(prev =>
            prev.some(s => s.sport_id === sportId)
                ? prev.filter(s => s.sport_id !== sportId)
                : [...prev, { sport_id: sportId }]
        );
    };

    const handleAddPricing = (sportId: number) => {
        setPricing([...pricing, { sport_id: sportId, pricing_type: 'session', price: 0 }]);
    };
    
    const handleRemovePricing = (index: number) => {
        setPricing(pricing.filter((_, i) => i !== index));
    };

    const handlePricingChange = (index: number, field: keyof CoachPricing, value: any) => {
        const newPricing = [...pricing];
        (newPricing[index] as any)[field] = value;
        setPricing(newPricing);
    };

    return (
        <form action={handleFormAction} className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">{isAdding ? 'Add New Coach' : 'Edit Coach'}</h1>
                <div className="flex items-center gap-2">
                    <Button variant="outline" type="button" asChild><Link href="/dashboard/coaches">Cancel</Link></Button>
                    <Button type="submit">Save Changes</Button>
                </div>
            </div>

            <Card>
                <CardHeader><CardTitle>Coach Information</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="user_id">Select User</Label>
                            <Select name="user_id" value={userId} onValueChange={setUserId} required>
                                <SelectTrigger><SelectValue placeholder="Select a user to be a coach" /></SelectTrigger>
                                <SelectContent>{users.map(u => <SelectItem key={u.id} value={u.id.toString()}>{u.name}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="profile_image_file">Profile Image</Label>
                            <Input id="profile_image_file" name="profile_image_file" type="file" accept="image/*" onChange={e => {
                                const file = e.target.files?.[0];
                                if (file) setProfileImagePreview(URL.createObjectURL(file));
                            }} />
                            {profileImagePreview && <Image src={profileImagePreview} alt="Logo preview" width={80} height={80} className="mt-2 rounded-full object-cover h-20 w-20" />}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="bio">Biography</Label>
                        <Textarea id="bio" name="bio" defaultValue={coach?.bio ?? ''} placeholder="Tell us about the coach..." />
                    </div>
                    <div className="flex items-center gap-2 rounded-lg border p-4">
                        <Switch id="is_independent" name="is_independent" checked={isIndependent} onCheckedChange={setIsIndependent} />
                        <Label htmlFor="is_independent">Is an independent coach (not exclusive to this organization)?</Label>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Sports & Specialization</CardTitle>
                    <CardDescription>Select the sports this coach specializes in.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {sports.map(sport => (
                        <div key={sport.id}
                             className={cn("p-4 rounded-md border-2 text-center cursor-pointer", selectedSports.some(s => s.sport_id === sport.id) ? 'border-primary' : 'border-dashed')}
                             onClick={() => handleSportSelect(sport.id)}>
                            {sport.name}
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Pricing Models</CardTitle>
                    <CardDescription>Set the pricing for each sport the coach teaches.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {selectedSports.map(({ sport_id }) => {
                        const sport = sports.find(s => s.id === sport_id);
                        if (!sport) return null;
                        
                        return (
                            <div key={sport.id} className="p-4 border rounded-lg">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-lg">{sport.name} Pricing</h3>
                                    <Button type="button" size="sm" variant="outline" onClick={() => handleAddPricing(sport.id)}>
                                        <Plus className="mr-2 h-4 w-4" /> Add Price
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    {pricing.filter(p => p.sport_id === sport.id).map((p, index) => (
                                        <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
                                            <div className="space-y-1">
                                                <Label>Type</Label>
                                                <Select value={p.pricing_type} onValueChange={(val) => handlePricingChange(pricing.indexOf(p), 'pricing_type', val)}>
                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="session">Per Session</SelectItem>
                                                        <SelectItem value="monthly">Monthly</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-1">
                                                <Label>Price (INR)</Label>
                                                <Input type="number" value={p.price ?? ''} onChange={(e) => handlePricingChange(pricing.indexOf(p), 'price', parseInt(e.target.value))} />
                                            </div>
                                            <div className="space-y-1 col-span-2 md:col-span-1">
                                                <Label>Description</Label>
                                                <Input value={p.description ?? ''} onChange={(e) => handlePricingChange(pricing.indexOf(p), 'description', e.target.value)} />
                                            </div>
                                            <Button type="button" variant="ghost" size="icon" onClick={() => handleRemovePricing(pricing.indexOf(p))}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </CardContent>
            </Card>

            <div className="flex items-center justify-end gap-2 sticky bottom-0 bg-background py-4">
                <Button variant="outline" type="button" asChild><Link href="/dashboard/coaches">Cancel</Link></Button>
                <Button type="submit">Save Changes</Button>
            </div>
        </form>
    );
}
