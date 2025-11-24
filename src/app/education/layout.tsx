
'use client';
import { useAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { BookOpen, PanelLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { UserNav } from '@/components/user-nav';
import { EducationNav } from '@/components/education-nav';
import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { SheetContext } from '@/hooks/use-sheet-context';


export default function EducationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading, session, profile } = useAuth();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  if (loading) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
             <div className="flex flex-col items-center gap-4">
                <Skeleton className="h-10 w-48" />
                <p className="text-muted-foreground">Loading Education Panel...</p>
            </div>
        </div>
    );
  }
  
  if (!session) {
    redirect('/login?type=education');
    return null;
  }

  if (profile && profile.user_type !== 7) {
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
   <SheetContext.Provider value={{ open: isSheetOpen, setOpen: setIsSheetOpen }}>
    <div className="flex h-screen w-full bg-muted/40">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-60 flex-col border-r bg-background sm:flex">
        <div className="flex h-16 shrink-0 items-center border-b px-6">
          <Link href="/education/dashboard" className="flex items-center gap-2 font-semibold text-primary">
            <BookOpen className="h-6 w-6" />
            <span>Education Panel</span>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
            <EducationNav />
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
                      <Link href="/education/dashboard" className="flex items-center gap-2 font-semibold text-primary">
                          <BookOpen className="h-6 w-6" />
                          <span>Education Panel</span>
                      </Link>
                  </div>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto py-4">
                    <EducationNav />
                </div>
            </SheetContent>
          </Sheet>
          
          <div className="ml-auto">
            <UserNav user={profile} basePath="/education" />
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
