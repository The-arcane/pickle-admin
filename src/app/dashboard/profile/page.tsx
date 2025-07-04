import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
    .select('name, email, phone, profile_image_url, created_at')
    .eq('user_uuid', user.id)
    .single();

  if (error || !userProfile) {
    // This could happen if the profile doesn't exist, so we redirect.
    return redirect('/login');
  }

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

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
      <Separator />

      <div className="flex items-center gap-6">
        <Avatar className="h-20 w-20">
            <AvatarImage src={userProfile.profile_image_url ?? undefined} alt={userProfile.name} />
            <AvatarFallback>{getInitials(userProfile.name)}</AvatarFallback>
        </Avatar>
        <div>
          <div className="text-xl font-bold">{userProfile.name}</div>
          <div className="text-muted-foreground">{userProfile.email}</div>
          <div className="text-sm text-muted-foreground">Member since {memberSince}</div>
        </div>
      </div>
      
      <form className="space-y-4 max-w-lg">
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
        <h2 className="text-lg font-semibold mb-4">Activity Summary</h2>
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
