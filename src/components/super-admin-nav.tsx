
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
    BarChart, Settings, User, Building, Users, List, Calendar, PartyPopper, Home, ShieldCheck, 
    TrendingUp, School, Hotel, Shield, ChevronDown, FolderKanban, UsersRound, Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSheetContext } from '@/hooks/use-sheet-context';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';
import { Separator } from './ui/separator';

const topItems = [
  { href: '/super-admin/dashboard', label: 'Dashboard', icon: BarChart, color: 'text-sky-500' },
];

const navGroups = [
  {
    title: 'Platform Management',
    icon: FolderKanban,
    color: 'text-blue-500',
    items: [
      { href: '/super-admin/organisations', label: 'Living Spaces', icon: Building, color: 'text-orange-500' },
      { href: '/super-admin/schools', label: 'Schools', icon: School, color: 'text-blue-500' },
      { href: '/super-admin/hospitality', label: 'Hospitality', icon: Hotel, color: 'text-purple-500' },
      { href: '/super-admin/arena', label: 'Arena', icon: Shield, color: 'text-gray-500' },
    ]
  },
  {
    title: 'User Management',
    icon: UsersRound,
    color: 'text-purple-500',
    items: [
       { href: '/super-admin/users', label: 'Users', icon: Users, color: 'text-violet-500' },
       { href: '/super-admin/admins', label: 'Admins', icon: ShieldCheck, color: 'text-red-500' },
       { href: '/super-admin/sales', label: 'Sales', icon: TrendingUp, color: 'text-green-500' },
       { href: '/super-admin/invitations', label: 'Invitations', icon: Home, color: 'text-teal-500' },
    ]
  },
  {
    title: 'Operational Data',
    icon: Activity,
    color: 'text-pink-500',
    items: [
      { href: '/super-admin/courts', label: 'Courts', icon: List, color: 'text-amber-500' },
      { href: '/super-admin/bookings', label: 'Bookings', icon: Calendar, color: 'text-rose-500' },
      { href: '/super-admin/events', label: 'Events', icon: PartyPopper, color: 'text-pink-500' },
    ]
  },
];

const bottomItems = [
  { href: '/super-admin/profile', label: 'Profile', icon: User, color: 'text-slate-500' },
  { href: '/super-admin/settings', label: 'Settings', icon: Settings, color: 'text-gray-500' },
];

export function SuperAdminNav() {
  const pathname = usePathname();
  const { setOpen } = useSheetContext();
  const [openSections, setOpenSections] = useState<string[]>(['Platform Management', 'User Management', 'Operational Data']);

  const isActive = (href: string) => {
    return pathname === href || (href !== '/super-admin/dashboard' && pathname.startsWith(href));
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
                <group.icon className={cn("h-4 w-4", group.color)} />
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
