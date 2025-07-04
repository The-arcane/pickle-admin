import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { createServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const supabase = createServer();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  const { data: userProfile, error } = await supabase
    .from('user')
    .select('name, email, phone, created_at')
    .eq('user_uuid', user.id)
    .single();

  if (error || !userProfile) {
    // This could happen if the profile doesn't exist, so we redirect.
    return redirect('/login');
  }

  const memberSince = new Date(userProfile.created_at).toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Profile</h1>
        <p className="text-muted-foreground">Manage your profile information and activity.</p>
      </div>

      <div className="space-y-1">
        <p className="text-sm">{userProfile.email}</p>
        <p className="text-sm text-muted-foreground">Member since {memberSince}</p>
      </div>
      
      <form className="space-y-6 max-w-lg">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input id="fullName" defaultValue={userProfile.name} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" defaultValue={userProfile.email} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" defaultValue={userProfile.phone ?? ''} />
        </div>
        <Button type="submit">Save Changes</Button>
      </form>
      
      <Separator />
      
      <div>
        <h2 className="text-xl font-semibold mb-4">Activity Summary</h2>
        <ul className="text-sm text-muted-foreground space-y-2 max-w-lg">
          <li className="flex justify-between">
            <span>Bookings made:</span>
            <span className="font-medium text-foreground">24</span>
          </li>
          <li className="flex justify-between">
            <span>Events attended:</span>
            <span className="font-medium text-foreground">5</span>
          </li>
          <li className="flex justify-between">
            <span>Feedback given:</span>
            <span className="font-medium text-foreground">3</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
