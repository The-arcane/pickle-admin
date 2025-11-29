

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createServer } from '@/lib/supabase/server';
import { User } from 'lucide-react';
import { redirect } from 'next/navigation';
import { updateSuperAdminProfile } from './actions';
import Link from 'next/link';

export default async function SuperAdminProfilePage() {
  const supabase = await createServer();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/super-admin/login');
  }

  const { data: userProfile, error } = await supabase
    .from('user')
    .select('name, email, phone')
    .eq('user_uuid', user.id)
    .single();

  if (error || !userProfile) {
    return redirect('/super-admin/login');
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <User className="h-8 w-8 text-slate-500" />
                <div>
                    <h1 className="text-2xl font-bold">Super Admin Profile</h1>
                    <p className="text-muted-foreground">Manage your profile information.</p>
                </div>
            </div>
             <Button variant="ghost" asChild>
                <Link href="/super-admin/dashboard">← Go Back</Link>
            </Button>
        </div>
      
      <form action={updateSuperAdminProfile} className="space-y-6 max-w-lg">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input id="fullName" name="fullName" defaultValue={userProfile.name ?? ''} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" defaultValue={userProfile.email ?? ''} disabled />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" defaultValue={userProfile.phone ?? ''} />
        </div>
        <Button type="submit">Save Changes</Button>
      </form>
    </div>
  );
}
