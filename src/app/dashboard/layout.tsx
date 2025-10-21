
'use client';

import { createClient } from '@/lib/supabase/client';
import { redirect } from 'next/navigation';
import { Cuboid, PanelLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { UserNav } from '@/components/user-nav';
import { DashboardNav } from '@/components/dashboard-nav';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { SheetContext } from '@/hooks/use-sheet-context';
import { Skeleton } from '@/components/ui/skeleton';

type UserProfile = {
  id: number;
  name: string;
  email: string;
  profile_image_url: string | null;
  user_type: number;
};

type Organisation = {
    name: string;
};

// This is now a fully client-side component that fetches its own data
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [organisationName, setOrganisationName] = useState('Lumen');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const supabase = useMemo(() => createClient(), []);

  const getDashboardInitialData = useCallback(async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      redirect('/login');
      return;
    }
    
    setUser(authUser);

    const { data: profile } = await supabase
      .from('user')
      .select('id, name, email, profile_image_url, user_type')
      .eq('user_uuid', authUser.id)
      .single();

    if (!profile) {
      redirect('/login?error=Could%20not%20find%20user%20profile');
      return;
    }
    setUserProfile(profile as UserProfile);

    const { data: orgLink } = await supabase
      .from('user_organisations')
      .select('organisation_id')
      .eq('user_id', profile.id)
      .single();
    
    if (orgLink?.organisation_id) {
      const { data: organisation } = await supabase
        .from('organisations')
        .select('name')
        .eq('id', orgLink.organisation_id)
        .single();
      if (organisation) {
          setOrganisationName(organisation.name);
      }
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    getDashboardInitialData();
  }, [getDashboardInitialData]);

  if (loading) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Skeleton className="h-10 w-48" />
                <p className="text-muted-foreground">Loading Dashboard...</p>
            </div>
        </div>
    );
  }

  if (!user || !userProfile) {
    // This will be caught by the redirect in the data fetching function,
    // but as a safeguard, we return null.
    return null;
  }

  return (
    <SheetContext.Provider value={{ open: isSheetOpen, setOpen: setIsSheetOpen }}>
      <div className="flex h-screen w-full bg-muted/40 overflow-hidden">
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
              <p className="text-xs text-muted-foreground">Version 16.3.13</p>
          </div>
        </aside>
        <div className="flex flex-col sm:pl-60 flex-1">
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-6 shrink-0">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
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
                              <span className="truncate" title={organisationName}>{organisationName}</span>
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
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">
            {children}
          </main>
        </div>
      </div>
    </SheetContext.Provider>
  );
}
