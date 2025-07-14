
import { createServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Shield, PanelLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { UserNav } from '@/components/user-nav';
import { SuperAdminNav } from '@/components/super-admin-nav';
import { OrganizationProvider } from '@/hooks/use-organization';

export const dynamic = 'force-dynamic';

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServer();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login?type=super-admin');
  }

  const { data: userProfile, error } = await supabase
    .from('user')
    .select('name, email, profile_image_url, user_type')
    .eq('user_uuid', user.id)
    .single();

  if (error || !userProfile || userProfile.user_type !== 3) {
    await supabase.auth.signOut();
    return redirect('/login?type=super-admin&error=Access%20Denied');
  }

  return (
    <OrganizationProvider>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
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
                        <Link href="/super-admin/dashboard" className="flex items-center gap-2 font-semibold text-primary">
                            <Shield className="h-6 w-6" />
                            <span>Lumen</span>
                        </Link>
                    </div>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto py-4">
                      <SuperAdminNav />
                  </div>
              </SheetContent>
            </Sheet>
            
            <div className="ml-auto">
              <UserNav user={userProfile} basePath="/super-admin" />
            </div>
          </header>
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </OrganizationProvider>
  );
}
