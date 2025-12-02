
'use client';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { TrendingUp, PanelLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { UserNav } from '@/components/user-nav';
import { SalesNav } from '@/components/sales-nav';
import { useState, useEffect } from 'react';
import { SheetContext } from '@/hooks/use-sheet-context';

export default function SalesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, profile, loading } = useAuth();
  const router = useRouter();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!session || !profile || profile.user_type !== 6) {
      router.replace("/login?type=sales");
    }
  }, [loading, session, profile, router]);

  if (loading || !session || !profile) {
    return <div className="flex h-screen items-center justify-center">Loading…</div>;
  }
  
  if (profile.user_type !== 6) {
    return null;
  }

  return (
   <SheetContext.Provider value={{ open: isSheetOpen, setOpen: setIsSheetOpen }}>
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-60 flex-col border-r bg-background sm:flex">
        <div className="flex h-16 shrink-0 items-center border-b px-6">
          <Link href="/sales/dashboard" className="flex items-center gap-2 font-semibold text-primary">
            <TrendingUp className="h-6 w-6" />
            <span>Sales</span>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
            <SalesNav />
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
                      <Link href="/sales/dashboard" className="flex items-center gap-2 font-semibold text-primary">
                          <TrendingUp className="h-6 w-6" />
                          <span>Sales</span>
                      </Link>
                  </div>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto py-4">
                    <SalesNav />
                </div>
            </SheetContent>
          </Sheet>
          
          <div className="ml-auto">
            <UserNav />
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  </SheetContext.Provider>
  );
}
