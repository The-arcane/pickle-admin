import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarTrigger, SidebarInset, SidebarFooter } from '@/components/ui/sidebar';
import { DashboardNav } from '@/components/dashboard-nav';
import { Cuboid } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
          <div className="relative ml-auto flex-1 md:grow-0">
             {/* Can add a search bar here if needed */}
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
