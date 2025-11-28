
'use client';
import { useAuth } from '@/lib/auth';
import { createClient } from '@/lib/supabase/client';
import { redirect } from 'next/navigation';
import { Shield, PanelLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { UserNav } from '@/components/user-nav';
import { ArenaNav } from '@/components/arena-nav';
import { useState, useEffect, useCallback } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { SheetContext } from '@/hooks/use-sheet-context';
import { OrganizationProvider } from '@/hooks/use-organization';

export default function ArenaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading, session, profile } = useAuth();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [organisationName, setOrganisationName] = useState('Arena');
  const [organisationType, setOrganisationType] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrgData = async () => {
        if (profile) {
            const supabase = createClient();
            const { data: orgLink } = await supabase
                .from('user_organisations')
                .select('organisation_id')
                .eq('user_id', profile.id)
                .maybeSingle();

            if (orgLink?.organisation_id) {
                const { data: orgData } = await supabase
                    .from('organisations')
                    .select('name, organisation_types(type_name)')
                    .eq('id', orgLink.organisation_id)
                    .maybeSingle();
                
                if (orgData) {
                    setOrganisationName(orgData.name);
                    setOrganisationType((orgData.organisation_types as any)?.type_name || null);
                }
            }
        }
    };
    fetchOrgData();
  }, [profile]);


  if (loading) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
             <div className="flex flex-col items-center gap-4">
                <Skeleton className="h-10 w-48" />
                <p className="text-muted-foreground">Loading Arena Panel...</p>
            </div>
        </div>
    );
  }
  
  if (!session) {
    redirect('/login?type=arena');
    return null;
  }
  
  if (profile && profile.user_type !== 9) {
      redirect('/');
      return null;
  }

  if(!profile) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
           <div className="flex flex-col items-center gap-4">
              <p className="text-muted-foreground">Error loading profile. Redirecting...</p>
          </div>
      </div>
    );
  }

  return (
    <OrganizationProvider>
       <SheetContext.Provider value={{ open: isSheetOpen, setOpen: setIsSheetOpen }}>
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
          <aside className="fixed inset-y-0 left-0 z-10 hidden w-60 flex-col border-r bg-background sm:flex">
            <div className="flex h-16 shrink-0 items-center border-b px-6">
              <Link href="/arena/dashboard" className="flex items-center gap-2 font-semibold text-primary">
                <Shield className="h-6 w-6" />
                <span className="truncate" title={organisationName}>{organisationName}</span>
              </Link>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
                <ArenaNav />
            </div>
            <div className="mt-auto p-4">
                <p className="text-xs text-muted-foreground capitalize">
                  {organisationType && `${organisationType} | `}Version 16.6.93
                </p>
            </div>
          </aside>
          <div className="flex flex-col sm:pl-60">
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
                          <Link href="/arena/dashboard" className="flex items-center gap-2 font-semibold text-primary">
                              <Shield className="h-6 w-6" />
                              <span className="truncate" title={organisationName}>{organisationName}</span>
                          </Link>
                      </div>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto py-4">
                        <ArenaNav />
                    </div>
                     <div className="mt-auto p-4">
                        <p className="text-xs text-muted-foreground capitalize">
                          {organisationType && `${organisationType} | `}Version 16.6.93
                        </p>
                    </div>
                </SheetContent>
              </Sheet>
              
              <div className="ml-auto">
                <UserNav user={profile} basePath="/arena" />
              </div>
            </header>
            <main className="flex-1 p-4 sm:p-6 overflow-x-hidden">
              {children}
            </main>
          </div>
        </div>
      </SheetContext.Provider>
    </OrganizationProvider>
  );
}
