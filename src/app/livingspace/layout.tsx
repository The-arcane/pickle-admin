
'use client';

import { useAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Cuboid, PanelLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { UserNav } from '@/components/user-nav';
import { DashboardNav } from '@/components/dashboard-nav';
import { useState, useEffect } from 'react';
import { SheetContext } from '@/hooks/use-sheet-context';
import { Skeleton } from '@/components/ui/skeleton';
import { OrganizationProvider, useOrganization } from '@/hooks/use-organization';
import { createClient } from '@/lib/supabase/client';


function InnerLayout({ children }: { children: React.ReactNode }) {
    const { profile } = useAuth();
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [organisationName, setOrganisationName] = useState('Living Space');
    const [organisationType, setOrganisationType] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrgData = async () => {
            if (profile) {
                const supabase = createClient();
                const { data: orgLink } = await supabase
                    .from('user_organisations')
                    .select('organisation_id')
                    .eq('user_id', profile.id)
                    .single();
                
                if (orgLink?.organisation_id) {
                    const { data: organisation } = await supabase
                        .from('organisations')
                        .select('name, organisation_types(type_name)')
                        .eq('id', orgLink.organisation_id)
                        .single();
                    
                    if (organisation) {
                        setOrganisationName(organisation.name);
                        const orgType = (organisation.organisation_types as any)?.type_name;
                        if (orgType) {
                            setOrganisationType(orgType);
                        }
                    }
                }
            }
        };
        fetchOrgData();
    }, [profile]);
    
    if (!profile) {
        return <div className="flex h-screen w-full items-center justify-center">Loading profile...</div>;
    }

    return (
        <SheetContext.Provider value={{ open: isSheetOpen, setOpen: setIsSheetOpen }}>
            <div className="flex h-screen w-full bg-muted/40 overflow-hidden">
            <aside className="fixed inset-y-0 left-0 z-10 hidden w-60 flex-col border-r bg-background sm:flex">
                <div className="flex h-16 shrink-0 items-center border-b px-6">
                <Link href="/livingspace" className="flex min-w-0 items-center gap-2 font-semibold text-primary">
                    <Cuboid className="h-6 w-6 shrink-0" />
                    <span className="truncate" title={organisationName}>{organisationName}</span>
                </Link>
                </div>
                <div className="flex-1 overflow-y-auto py-4">
                    <DashboardNav />
                </div>
                <div className="mt-auto p-4">
                    <p className="text-xs text-muted-foreground capitalize">
                    {organisationType && `${organisationType} | `}Version 16.6.91
                    </p>
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
                                <Link href="/livingspace" className="flex min-w-0 items-center gap-2 font-semibold text-primary">
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
                
                <div className="sm:hidden" />

                <div className="ml-auto">
                    <UserNav user={profile} basePath="/livingspace" />
                </div>
                </header>
                <main className="flex-1 overflow-y-auto p-4 sm:p-6">
                {children}
                </main>
            </div>
            </div>
        </SheetContext.Provider>
    )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading, session, profile } = useAuth();
  
  if (loading) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Skeleton className="h-10 w-48" />
                <p className="text-muted-foreground">Loading Living Space Panel...</p>
            </div>
        </div>
    );
  }

  if (!session) {
      redirect('/login');
      return null;
  }
  
  if (profile && profile.user_type !== 2) {
      redirect('/');
      return null;
  }

  return (
    <OrganizationProvider>
        <InnerLayout>{children}</InnerLayout>
    </OrganizationProvider>
  );
}
