
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
    return redirect('/login?type=employee');
  }

  const { data: userProfile, error } = await supabase
    .from('user')
    .select('name, email, profile_image_url, user_type')
    .eq('user_uuid', user.id)
    .single();

  if (error || !userProfile || userProfile.user_type !== 4) {
    return redirect('/login?type=employee&error=Access%20Denied');
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-6">
        <div className="flex items-center gap-4">
          <Link href="/employee/dashboard" className="flex items-center gap-2 font-semibold text-primary">
            <Cuboid className="h-6 w-6" />
            <span>LUMEN (Employee)</span>
          </Link>
          <div className="hidden md:flex">
            <EmployeeNav />
          </div>
        </div>
        
        <div className="flex items-center gap-4">
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button size="icon" variant="outline">
                    <PanelLeft className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="flex flex-col p-0 sm:max-w-xs">
                    <div className="flex h-16 shrink-0 items-center border-b px-6">
                        <Link href="/employee/dashboard" className="flex items-center gap-2 font-semibold text-primary">
                            <Cuboid className="h-6 w-6" />
                            <span>LUMEN</span>
                        </Link>
                    </div>
                    <div className="flex-1 overflow-y-auto py-4">
                        <EmployeeNav />
                    </div>
                </SheetContent>
              </Sheet>
            </div>
            <UserNav user={userProfile} />
        </div>
      </header>
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}
