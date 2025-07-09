
import { createServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Cuboid, PanelLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { UserNav } from '@/components/user-nav';
import { EmployeeNav } from '@/components/employee-nav';

export const dynamic = 'force-dynamic';

export default async function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServer();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // If no user, the middleware handles redirection for protected routes.
    // The login page will be rendered here without the layout shell.
    return <>{children}</>;
  }

  // Fetch user profile
  const { data: userProfile, error: profileError } = await supabase
    .from('user')
    .select('id, name, email, profile_image_url, user_type')
    .eq('user_uuid', user.id)
    .single();

  if (profileError || !userProfile || userProfile.user_type !== 4) {
    return redirect('/login?type=employee&error=Access%20Denied');
  }

  // Fetch organization link to get the ID
  const { data: orgLink } = await supabase
    .from('user_organisations')
    .select('organisation_id')
    .eq('user_id', userProfile.id)
    .maybeSingle();

  let organisationName = 'Employee Panel';
  if (orgLink?.organisation_id) {
    const { data: orgData } = await supabase
        .from('organisations')
        .select('name')
        .eq('id', orgLink.organisation_id)
        .single();
    organisationName = orgData?.name || 'Employee Panel';
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-60 flex-col border-r bg-background sm:flex">
        <div className="flex h-16 shrink-0 items-center border-b px-6">
          <Link href="/employee/dashboard" className="flex min-w-0 items-center gap-2 font-semibold text-primary">
            <Cuboid className="h-6 w-6 shrink-0" />
            <span className="truncate" title={organisationName}>{organisationName}</span>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
            <EmployeeNav />
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
                    <Link href="/employee/dashboard" className="flex min-w-0 items-center gap-2 font-semibold text-primary">
                        <Cuboid className="h-6 w-6 shrink-0" />
                        <span className="truncate" title={organisationName}>{organisationName}</span>
                    </Link>
                </div>
                <div className="flex-1 overflow-y-auto py-4">
                    <EmployeeNav />
                </div>
            </SheetContent>
          </Sheet>
          
          <div className="sm:hidden">
             {/* This div is to push the UserNav to the right on mobile when the SheetTrigger is not displayed */}
          </div>

          <div className="ml-auto">
            <UserNav user={userProfile} basePath="/employee" />
          </div>
        </header>
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
