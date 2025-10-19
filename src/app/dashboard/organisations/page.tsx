
import { createServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { updateOrganization } from './actions';
import { Separator } from '@/components/ui/separator';

export const dynamic = 'force-dynamic';

export default async function OrganisationPage() {
    const supabase = await createServer();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return redirect('/login');
    }

    const { data: userRecord } = await supabase
        .from('user')
        .select('id')
        .eq('user_uuid', user.id)
        .single();
    
    if (!userRecord) {
        return redirect('/login');
    }

    const { data: orgLink } = await supabase
        .from('user_organisations')
        .select('organisation_id')
        .eq('user_id', userRecord.id)
        .maybeSingle();

    if (!orgLink?.organisation_id) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <p className="text-muted-foreground">You are not associated with a Living Space.</p>
            </div>
        );
    }
    
    const { data: org, error } = await supabase
        .from('organisations')
        .select('*')
        .eq('id', orgLink.organisation_id)
        .single();

    if (error || !org) {
        return <p>Could not load Living Space details.</p>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Building className="h-8 w-8 text-orange-500" />
                <div>
                    <h1 className="text-3xl font-bold">Living Space Profile</h1>
                    <p className="text-muted-foreground">Manage your Living Space's public information.</p>
                </div>
            </div>
            <form action={updateOrganization}>
                <input type="hidden" name="id" value={org.id} />
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                        <CardDescription>Update the name and address of your Living Space.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Living Space Name</Label>
                            <Input id="name" name="name" defaultValue={org.name || ''} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Textarea id="address" name="address" defaultValue={org.address || ''} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="logo">Logo URL</Label>
                            <Input id="logo" name="logo" defaultValue={org.logo || ''} />
                        </div>
                    </CardContent>
                </Card>
                 <div className="flex justify-end pt-4">
                    <Button type="submit">Save Changes</Button>
                </div>
            </form>
        </div>
    );
}
