import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarTrigger, SidebarInset, SidebarFooter } from '@/components/ui/sidebar';
import { DashboardNav } from '@/components/dashboard-nav';
import { UserNav } from '@/components/user-nav';
import { Cuboid, Settings } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  const { data: userProfile, error } = await supabase
    .from('user')
    .select('name, email, profile_image_url')
    .eq('user_uuid', user.id)
    .single();

  if (error || !userProfile) {
    // This could happen if the profile isn't created yet or there's a DB error.
    // To be safe, we'll sign out and redirect to login.
    await supabase.auth.signOut();
    return redirect('/login');
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="flex items-center p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <div className="flex items-center gap-2 text-primary">
                <Cuboid className="h-6 w-6" />
                <h1 className="text-lg font-bold">LUMEN</h1>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent className="p-2">
            <div className="px-2 pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                MENU
            </div>
            <DashboardNav />
        </SidebarContent>
        <SidebarFooter className="mt-auto p-4">
            <p className="text-xs text-muted-foreground">Version 1.0</p>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <SidebarTrigger className="sm:hidden" />
          <div className="flex-1" />
          <Link href="/dashboard/settings">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings className="h-4 w-4" />
              <span className="sr-only">Settings</span>
            </Button>
          </Link>
          <UserNav user={userProfile} />
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
