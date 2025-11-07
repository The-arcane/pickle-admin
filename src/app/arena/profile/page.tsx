
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { createServer } from '@/lib/supabase/server';
import { User } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function ArenaProfilePage() {
  const supabase = await createServer();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login?type=arena');
  }

  const { data: userProfile, error } = await supabase
    .from('user')
    .select('name, email, phone, created_at')
    .eq('user_uuid', user.id)
    .single();

  if (error || !userProfile) {
    return redirect('/login?type=arena');
  }

  const memberSince = new Date(userProfile.created_at).toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <User className="h-8 w-8 text-slate-500" />
        <div>
            <h1 className="text-2xl font-bold">Admin Profile</h1>
            <p className="text-muted-foreground">View your profile information.</p>
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-sm">{userProfile.email}</p>
        <p className="text-sm text-muted-foreground">Member since {memberSince}</p>
      </div>
      
      <form className="space-y-6 max-w-lg">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input id="fullName" defaultValue={userProfile.name ?? ''} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" defaultValue={userProfile.email ?? ''} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" defaultValue={userProfile.phone ?? ''} />
        </div>
        <Button type="submit">Save Changes</Button>
      </form>
    </div>
  );
}
