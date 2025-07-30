
import { createServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Cuboid, PanelLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { UserNav } from '@/components/user-nav';
import { DashboardNav } from '@/components/dashboard-nav';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServer();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  // Check 1: Fetch the user's profile and verify they are an admin type
  const { data: userProfile, error: profileError } = await supabase
    .from('user')
    .select('id, name, email, profile_image_url, user_type')
    .eq('user_uuid', user.id)
    .single();

  if (profileError || !userProfile || userProfile.user_type !== 2) {
    // This case should be primarily handled by middleware, but serves as a final safeguard.
    await supabase.auth.signOut();
    return redirect('/login?error=Access%20Denied');
  }

  // Check 2: Verify the admin user is associated with an organization
  const { data: orgLink, error: orgLinkError } = await supabase
    .from('user_organisations')
    .select('organisation_id')
    .eq('user_id', userProfile.id)
    .maybeSingle();

  // If this fails, the user is an admin but has no org. Redirect them.
  if (orgLinkError || !orgLink?.organisation_id) {
    await supabase.auth.signOut();
    return redirect('/login?error=Admin%20profile%20is%20not%20correctly%20associated%20with%20any%20organization');
  }
  
  const organisationId = orgLink.organisation_id;

  // Fetch the organization's name for display
  let organisationName = 'Lumen';
  const { data: organisation } = await supabase
    .from('organisations')
    .select('name')
    .eq('id', organisationId)
    .single();
    
  if (organisation) {
    organisationName = organisation.name;
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
            <p className="text-xs text-muted-foreground">Version 9.3.0(R)</p>
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
                <SheetHeader className="border-b">
                   <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                    <div className="flex h-16 shrink-0 items-center px-6">
                        <Link href="/dashboard" className="flex min-w-0 items-center gap-2 font-semibold text-primary">
                            <Cuboid className="h-6 w-6 shrink-0" />
                            <span className="truncate" title={organisationName}>Lumen</span>
                        </Link>
                    </div>
                </SheetHeader>
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
