
'use client';
import { createClient } from '@/lib/supabase/client';
import { redirect } from 'next/navigation';
import { Shield, PanelLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { UserNav } from '@/components/user-nav';
import { SuperAdminNav } from '@/components/super-admin-nav';
import { OrganizationProvider } from '@/hooks/use-organization';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { SheetContext } from '@/hooks/use-sheet-context';

type UserProfile = {
  name: string;
  email: string;
  profile_image_url: string | null;
  user_type: number;
};

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const supabase = useMemo(() => createClient(), []);

  const getInitialData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      redirect('/login?type=super-admin');
      return;
    }
    
    const { data: profile } = await supabase
      .from('user')
      .select('name, email, profile_image_url, user_type')
      .eq('user_uuid', user.id)
      .single();

    if (!profile) {
      redirect('/login?type=super-admin&error=Could%20not%20find%20user%20profile');
      return;
    }
    
    setUserProfile(profile as UserProfile);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    getInitialData();
  }, [getInitialData]);

  if (loading) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
             <div className="flex flex-col items-center gap-4">
                <Skeleton className="h-10 w-48" />
                <p className="text-muted-foreground">Loading Super Admin Dashboard...</p>
            </div>
        </div>
    );
  }
  
  if (!userProfile) {
    return null; // Redirect is handled in getInitialData
  }


  return (
    <OrganizationProvider>
       <SheetContext.Provider value={{ open: isSheetOpen, setOpen: setIsSheetOpen }}>
        <div className="flex h-screen w-full bg-muted/40">
          <aside className="fixed inset-y-0 left-0 z-10 hidden w-60 flex-col border-r bg-background sm:flex">
            <div className="flex h-16 shrink-0 items-center border-b px-6">
              <Link href="/super-admin/dashboard" className="flex items-center gap-2 font-semibold text-primary">
                <Shield className="h-6 w-6" />
                <span>Lumen</span>
              </Link>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
                <SuperAdminNav />
            </div>
             <div className="mt-auto p-4">
                <p className="text-xs text-muted-foreground">Version 16.3.93</p>
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
                          <Link href="/super-admin/dashboard" className="flex items-center gap-2 font-semibold text-primary">
                              <Shield className="h-6 w-6" />
                              <span>Lumen</span>
                          </Link>
                      </div>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto py-4">
                        <SuperAdminNav />
                    </div>
                     <div className="mt-auto p-4">
                        <p className="text-xs text-muted-foreground">Version 16.3.93</p>
                    </div>
                </SheetContent>
              </Sheet>
              
              <div className="ml-auto">
                <UserNav user={userProfile} basePath="/super-admin" />
              </div>
            </header>
            <main className="flex-1 overflow-y-auto p-4 sm:p-6">
              {children}
            </main>
          </div>
        </div>
      </SheetContext.Provider>
    </OrganizationProvider>
  );
}
