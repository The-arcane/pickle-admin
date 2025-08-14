
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart, Settings, User, Users, PartyPopper, CalendarCheck, BookCopy, Megaphone, MessageSquare, LineChart, Trophy, Image as ImageIcon, Calendar as CalendarIcon, ShieldAlert, Box, Handshake, HeartPulse, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSheetContext } from '@/hooks/use-sheet-context';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';
import { Separator } from './ui/separator';

const navGroups = [
  {
    title: 'Academics',
    items: [
      { href: '/education/attendance', label: 'Attendance', icon: CalendarCheck },
      { href: '/education/skills', label: 'Skills', icon: Trophy },
      { href: '/education/users', label: 'Admin Users', icon: Users },
      { href: '/education/residences', label: 'Parents', icon: Users },
    ]
  },
  {
    title: 'Activities',
    items: [
      { href: '/education/events', label: 'Events', icon: PartyPopper },
      { href: '/education/season', label: 'Season', icon: Trophy },
      { href: '/education/media', label: 'Media', icon: ImageIcon },
      { href: '/education/calendar', label: 'Calendar', icon: CalendarIcon },
    ]
  },
  {
    title: 'Administration',
    items: [
      { href: '/education/notifications', label: 'Notifications', icon: Megaphone },
      { href: '/education/communication', label: 'Communication', icon: MessageSquare },
      { href: '/education/reports', label: 'Reports', icon: LineChart },
      { href: '/education/alerts', label: 'Emergency Alerts', icon: ShieldAlert },
      { href: '/education/inventory', label: 'Inventory', icon: Box },
      { href: '/education/resources', label: 'Resources', icon: BookCopy },
      { href: '/education/sponsors', label: 'Sponsors', icon: Handshake },
      { href: '/education/health', label: 'Health & Safety', icon: HeartPulse },
    ]
  }
];

const topItems = [
    { href: '/education/dashboard', label: 'Dashboard', icon: BarChart },
];

const bottomItems = [
    { href: '/education/settings', label: 'Settings', icon: Settings },
];

export function EducationNav() {
  const pathname = usePathname();
  const { setOpen } = useSheetContext();
  const [openSections, setOpenSections] = useState<string[]>([]);

  const isActive = (href: string) => {
    return pathname === href || (href !== '/education/dashboard' && pathname.startsWith(href));
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
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}

        {navGroups.map((group) => (
          <Collapsible key={group.title} open={openSections.includes(group.title)} onOpenChange={() => toggleSection(group.title)} className="mt-1">
              <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary [&[data-state=open]>div>svg]:rotate-180">
                <div className="flex items-center gap-3">
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
                  <item.icon className="h-4 w-4" />
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
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
