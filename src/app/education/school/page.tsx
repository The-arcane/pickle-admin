
import { createServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { School } from 'lucide-react';

export default async function SchoolProfilePage() {
  const supabase = await createServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/login?type=education');
  }

  const { data: userProfile } = await supabase.from('user').select('id').eq('user_uuid', user.id).single();
  if (!userProfile) {
    return redirect('/login?type=education&error=User profile not found.');
  }

  const { data: orgLink } = await supabase.from('user_organisations').select('organisation_id').eq('user_id', userProfile.id).single();
  if (!orgLink) {
    return <p>You are not associated with any school.</p>;
  }

  const { data: school, error } = await supabase.from('organisations').select('name, address').eq('id', orgLink.organisation_id).single();

  if (error || !school) {
    return <p>Could not load school profile.</p>;
  }

  return (
    <div className="space-y-6">
        <div className="flex items-center gap-3">
            <School className="h-8 w-8 text-primary" />
            <div>
                <h1 className="text-3xl font-bold">School Profile</h1>
                <p className="text-muted-foreground">View your school's details.</p>
            </div>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>{school.name}</CardTitle>
                <CardDescription>
                    This is the information on record for your institution.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <h3 className="font-medium">Address</h3>
                    <p className="text-muted-foreground">{school.address}</p>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
