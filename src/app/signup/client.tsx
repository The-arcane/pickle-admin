
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { signup } from './actions';
import { getBuildings, getFlatsForWing } from '@/app/livingspace/approvals/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, PlusCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type BuildingWithWings = {
    id: number;
    name: string;
    building_numbers: { id: number; number: string; }[];
}

type Flat = {
    id: number;
    flat_number: string;
};

export function SignupForm() {
    const supabase = createClient();
    const searchParams = useSearchParams();
    const orgId = searchParams.get('org');
    const [error, setError] = useState<string | null>(searchParams.get('error'));
    const [organisationName, setOrganisationName] = useState('');
    const [buildings, setBuildings] = useState<BuildingWithWings[]>([]);
    const [selectedBuildingId, setSelectedBuildingId] = useState<string>('');
    const [selectedBuildingNumberId, setSelectedBuildingNumberId] = useState<string>('');
    const [flats, setFlats] = useState<Flat[]>([]);
    const [selectedFlat, setSelectedFlat] = useState<string>('');
    const [isAddingNewFlat, setIsAddingNewFlat] = useState(false);
    const [newFlatNumber, setNewFlatNumber] = useState('');
    const [isLoadingFlats, setIsLoadingFlats] = useState(false);

    useEffect(() => {
        async function fetchOrgDetails() {
            if (!orgId) return;

            const { data: orgData, error: orgError } = await supabase
                .from('organisations')
                .select('name')
                .eq('id', orgId)
                .single();
            
            if (orgError) {
                setError("Could not find the specified organization.");
            } else {
                setOrganisationName(orgData.name);
            }

            const { data: buildingsData, error: buildingsError } = await supabase
                .from('buildings')
                .select('id, name, building_numbers(id, number)')
                .eq('organisation_id', orgId)
                .order('name');

            if (buildingsError) {
                console.error("Error fetching buildings", buildingsError);
            } else {
                setBuildings(buildingsData || []);
            }
        }
        fetchOrgDetails();
    }, [orgId, supabase]);

    useEffect(() => {
        async function fetchFlats() {
            if (!selectedBuildingNumberId) {
                setFlats([]);
                return;
            }
            setIsLoadingFlats(true);
            try {
                const fetchedFlats = await getFlatsForWing(Number(selectedBuildingNumberId));
                setFlats(fetchedFlats);
            } finally {
                setIsLoadingFlats(false);
            }
        }
        fetchFlats();
    }, [selectedBuildingNumberId]);

    const wingsForSelectedBuilding = buildings.find(b => b.id.toString() === selectedBuildingId)?.building_numbers || [];

    const flatToSubmit = isAddingNewFlat ? newFlatNumber : selectedFlat;

    return (
        <Card className="w-full max-w-lg">
            <CardHeader>
                <CardTitle>Join {organisationName || 'Your Community'}</CardTitle>
                <CardDescription>
                    Create an account to get access to court bookings, events, and more.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {error && (
                <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Sign Up Failed</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
                )}
                <form action={signup} className="space-y-4">
                    <input type="hidden" name="organisation_id" value={orgId || ''} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2"><Label htmlFor="name">Full Name</Label><Input name="name" id="name" placeholder="John Doe" required /></div>
                        <div className="space-y-2"><Label htmlFor="email">Email</Label><Input name="email" id="email" type="email" placeholder="you@example.com" required /></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2"><Label htmlFor="password">Password</Label><Input name="password" id="password" type="password" required /></div>
                        <div className="space-y-2"><Label htmlFor="confirmPassword">Confirm Password</Label><Input name="confirmPassword" id="confirmPassword" type="password" required /></div>
                    </div>
                    
                    <CardTitle className="text-lg pt-4">Your Residence</CardTitle>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="building">Building</Label>
                            <Select onValueChange={setSelectedBuildingId}>
                                <SelectTrigger id="building"><SelectValue placeholder="Select Building" /></SelectTrigger>
                                <SelectContent>{buildings.map(b => <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="building_number_id">Wing/Block</Label>
                                <Select name="building_number_id" onValueChange={setSelectedBuildingNumberId} disabled={!selectedBuildingId}>
                                <SelectTrigger id="building_number_id"><SelectValue placeholder="Select Wing/Block" /></SelectTrigger>
                                <SelectContent>
                                    {wingsForSelectedBuilding.map(w => <SelectItem key={w.id} value={w.id.toString()}>{w.number}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="flat">Flat Number</Label>
                        <input type="hidden" name="flat" value={flatToSubmit} />
                         {isAddingNewFlat ? (
                                <div className="flex items-center gap-2">
                                    <Input value={newFlatNumber} onChange={e => setNewFlatNumber(e.target.value.toUpperCase().replace(/\s+/g, ''))} placeholder="Enter new flat number"/>
                                    <Button type="button" variant="ghost" onClick={() => setIsAddingNewFlat(false)}>Cancel</Button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Select onValueChange={setSelectedFlat} disabled={!selectedBuildingNumberId || isLoadingFlats}>
                                        <SelectTrigger id="flat">
                                            <SelectValue placeholder={isLoadingFlats ? 'Loading...' : 'Select Flat'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {flats.map(f => <SelectItem key={f.id} value={f.flat_number}>{f.flat_number}</SelectItem>)}
                                            {flats.length === 0 && !isLoadingFlats && <SelectItem value="none" disabled>No flats found</SelectItem>}
                                        </SelectContent>
                                    </Select>
                                    <Button type="button" variant="outline" size="sm" onClick={() => setIsAddingNewFlat(true)} disabled={!selectedBuildingNumberId}>
                                        <PlusCircle className="mr-2 h-4 w-4" /> Add
                                    </Button>
                                </div>
                            )}
                    </div>

                    <Button type="submit" className="w-full">Sign Up</Button>
                </form>
                <div className="mt-4 text-center text-sm">
                    Already have an account?{' '}
                    <Link href="/login" className="underline">
                        Sign in
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}

