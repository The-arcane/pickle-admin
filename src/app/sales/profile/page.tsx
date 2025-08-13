
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function SalesProfilePage() {
  const supabase = await createServer();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login?type=sales');
  }

  const { data: userProfile, error } = await supabase
    .from('user')
    .select('name, email, phone, created_at')
    .eq('user_uuid', user.id)
    .single();

  if (error || !userProfile) {
    return redirect('/login?type=sales');
  }

  const memberSince = new Date(userProfile.created_at).toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Sales Profile</h1>
        <p className="text-muted-foreground">View your profile information.</p>
      </div>

      <div className="space-y-1">
        <p className="text-sm">{userProfile.email}</p>
        <p className="text-sm text-muted-foreground">Member since {memberSince}</p>
      </div>
      
      <form className="space-y-6 max-w-lg">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input id="fullName" defaultValue={userProfile.name ?? ''} disabled />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" defaultValue={userProfile.email ?? ''} disabled />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" defaultValue={userProfile.phone ?? ''} disabled />
        </div>
      </form>
    </div>
  );
}
