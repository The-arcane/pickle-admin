
import { createServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Cuboid, PanelLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { UserNav } from '@/components/user-nav';
import { DashboardNav } from '@/components/dashboard-nav';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServer();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // This case should be handled by middleware, but as a safeguard:
    return redirect('/login');
  }

  // Fetch the user's profile, including their internal ID
  const { data: userProfile, error } = await supabase
    .from('user')
    .select('id, name, email, profile_image_url, user_type')
    .eq('user_uuid', user.id)
    .single();

  // If profile doesn't exist or user is not an admin, redirect.
  if (error || !userProfile || userProfile.user_type !== 2) {
    // The middleware should handle this, but as a fallback, clear session and redirect.
    await supabase.auth.signOut();
    return redirect('/login?error=Access%20Denied');
  }

  // Now, find which organization this admin user belongs to.
  const { data: orgLink } = await supabase
    .from('user_organisations')
    .select('organisation_id')
    .eq('user_id', userProfile.id)
    .maybeSingle(); // An admin should only belong to one org.

  let organisationName = 'Admin Panel'; // Default fallback name
  if (orgLink?.organisation_id) {
    // If we found the link, fetch the organization's name
    const { data: organisation } = await supabase
      .from('organisations')
      .select('name')
      .eq('id', orgLink.organisation_id)
      .single();
    
    organisationName = organisation?.name || 'Admin Panel';
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-60 flex-col border-r bg-background sm:flex">
        <div className="flex h-16 shrink-0 items-center border-b px-6">
          <Link href="/dashboard" className="flex min-w-0 items-center gap-2 font-semibold text-primary">
            <Cuboid className="h-6 w-6 shrink-0" />
            <span className="truncate" title={organisationName}>{organisationName}</span>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
            <DashboardNav />
        </div>
        <div className="mt-auto p-4">
            <p className="text-xs text-muted-foreground">Version 1.0</p>
        </div>
      </aside>
      <div className="flex flex-col sm:pl-60">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="sm:hidden">
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0 sm:max-w-xs">
                <div className="flex h-16 shrink-0 items-center border-b px-6">
                    <Link href="/dashboard" className="flex min-w-0 items-center gap-2 font-semibold text-primary">
                        <Cuboid className="h-6 w-6 shrink-0" />
                        <span className="truncate" title={organisationName}>{organisationName}</span>
                    </Link>
                </div>
                <div className="flex-1 overflow-y-auto py-4">
                    <DashboardNav />
                </div>
            </SheetContent>
          </Sheet>
          
          <div className="sm:hidden">
             {/* This div is to push the UserNav to the right on mobile when the SheetTrigger is not displayed */}
          </div>

          <div className="ml-auto">
            <UserNav user={userProfile} basePath="/dashboard" />
          </div>
        </header>
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
