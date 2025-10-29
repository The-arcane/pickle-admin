
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
    BarChart, Calendar, List, Settings, User, Users, PartyPopper, Home, Briefcase, 
    Contact2, Radio, UserCheck, Building, ChevronDown, FolderKanban, Wrench, UsersRound 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSheetContext } from '@/hooks/use-sheet-context';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';
import { Separator } from './ui/separator';

const topItems = [
  { href: '/dashboard', label: 'Dashboard', icon: BarChart, color: 'text-sky-500' },
];

const navGroups = [
  {
    title: 'Management',
    icon: FolderKanban,
    items: [
      { href: '/dashboard/bookings', label: 'Bookings', icon: Calendar, color: 'text-green-500' },
      { href: '/dashboard/events', label: 'Events', icon: PartyPopper, color: 'text-pink-500' },
      { href: '/dashboard/approvals', label: 'Approvals', icon: UserCheck, color: 'text-cyan-500' },
      { href: '/dashboard/invitations', label: 'Invitations', icon: Home, color: 'text-teal-500' },
    ]
  },
  {
    title: 'Operations',
    icon: Wrench,
    items: [
      { href: '/dashboard/courts', label: 'Court List', icon: List, color: 'text-amber-500' },
      { href: '/dashboard/channels', label: 'Channels', icon: Radio, color: 'text-indigo-500' },
    ]
  },
  {
    title: 'Personnel',
    icon: UsersRound,
    items: [
       { href: '/dashboard/users', label: 'Users', icon: Users, color: 'text-violet-500' },
       { href: '/dashboard/employees', label: 'Employees', icon: Briefcase, color: 'text-orange-500' },
       { href: '/dashboard/coaches', label: 'Coaches', icon: Contact2, color: 'text-rose-500' },
    ]
  },
];

const bottomItems = [
  { href: '/dashboard/organisations', label: 'My Space', icon: Building, color: 'text-orange-500' },
  { href: '/dashboard/profile', label: 'Admin Profile', icon: User, color: 'text-slate-500' },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings, color: 'text-gray-500' },
];

export function DashboardNav() {
  const pathname = usePathname();
  const { setOpen } = useSheetContext();
  const [openSections, setOpenSections] = useState<string[]>(['Management', 'Operations', 'Personnel']);

  const isActive = (href: string) => {
    return pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
  }

  const toggleSection = (title: string) => {
    setOpenSections(prev => 
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    );
  };

  return (
    <nav className="flex flex-col h-full gap-1 px-2 text-sm font-medium">
      <div className="flex-1 overflow-y-auto">
        {topItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen && setOpen(false)}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
              isActive(item.href) && 'bg-muted text-primary'
            )}
          >
            <item.icon className={cn("h-4 w-4", item.color)} />
            {item.label}
          </Link>
        ))}

        {navGroups.map((group) => (
          <Collapsible key={group.title} open={openSections.includes(group.title)} onOpenChange={() => toggleSection(group.title)} className="mt-1">
            <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary [&[data-state=open]>div>svg]:rotate-180">
              <div className="flex items-center gap-3">
                <group.icon className="h-4 w-4" />
                <span className="font-semibold">{group.title}</span>
              </div>
              <div className="flex items-center gap-3">
                <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-4 border-l ml-5 space-y-1 py-1">
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen && setOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                    isActive(item.href) && 'bg-muted text-primary'
                  )}
                >
                  <item.icon className={cn("h-4 w-4", item.color)} />
                  {item.label}
                </Link>
              ))}
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
      
      <div className="mt-auto">
        <Separator className="my-2" />
        {bottomItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen && setOpen(false)}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
              isActive(item.href) && 'bg-muted text-primary'
            )}
          >
            <item.icon className={cn("h-4 w-4", item.color)} />
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
