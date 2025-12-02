
'use client';
import { useAuth } from '@/lib/auth';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Cuboid, PanelLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { UserNav } from '@/components/user-nav';
import { EmployeeNav } from '@/components/employee-nav';
import { useState, useEffect } from 'react';

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, profile, loading } = useAuth();
  const router = useRouter();
  const [organisationName, setOrganisationName] = useState('Lumen');

  useEffect(() => {
    if (loading) return;
    if (!session || !profile || profile.user_type !== 4) {
      router.replace("/login?type=employee");
    }
  }, [loading, session, profile, router]);

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
                    .select('name')
                    .eq('id', orgLink.organisation_id)
                    .single();
                setOrganisationName(orgData?.name || 'Lumen');
            }
        }
    };
    fetchOrgData();
  }, [profile]);
  
  if (loading || !session || !profile) {
    return <div className="flex h-screen items-center justify-center">Loading…</div>;
  }
  
  if (profile.user_type !== 4) {
    return null;
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
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-6 shrink-0">
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
                        <Link href="/employee/dashboard" className="flex min-w-0 items-center gap-2 font-semibold text-primary">
                            <Cuboid className="h-6 w-6 shrink-0" />
                            <span className="truncate" title={organisationName}>{organisationName}</span>
                        </Link>
                    </div>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto py-4">
                    <EmployeeNav />
                </div>
            </SheetContent>
          </Sheet>
          
          <div className="sm:hidden" />

          <div className="ml-auto">
            <UserNav />
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
