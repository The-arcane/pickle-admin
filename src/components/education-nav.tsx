
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart, Settings, User, Users, PartyPopper, CalendarCheck, BookCopy, Megaphone, MessageSquare, LineChart, Trophy, Image as ImageIcon, Calendar as CalendarIcon, ShieldAlert, Box, Handshake, HeartPulse, ChevronDown, GraduationCap, Activity, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSheetContext } from '@/hooks/use-sheet-context';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';
import { Separator } from './ui/separator';

const navGroups = [
  {
    title: 'Academics',
    icon: GraduationCap,
    items: [
      { href: '/education/attendance', label: 'Attendance', icon: CalendarCheck, color: 'text-teal-500' },
      { href: '/education/skills', label: 'Skills', icon: Trophy, color: 'text-yellow-500' },
      { href: '/education/users', label: 'Admin Users', icon: Users, color: 'text-violet-500' },
      { href: '/education/residences', label: 'Parents', icon: Users, color: 'text-purple-500' },
    ]
  },
  {
    title: 'Activities',
    icon: Activity,
    items: [
      { href: '/education/events', label: 'Events', icon: PartyPopper, color: 'text-pink-500' },
      { href: '/education/season', label: 'Season', icon: Trophy, color: 'text-amber-500' },
      { href: '/education/media', label: 'Media', icon: ImageIcon, color: 'text-cyan-500' },
      { href: '/education/calendar', label: 'Calendar', icon: CalendarIcon, color: 'text-blue-500' },
    ]
  },
  {
    title: 'Administration',
    icon: SlidersHorizontal,
    items: [
      { href: '/education/notifications', label: 'Notifications', icon: Megaphone, color: 'text-yellow-600' },
      { href: '/education/communication', label: 'Communication', icon: MessageSquare, color: 'text-purple-600' },
      { href: '/education/reports', label: 'Reports', icon: LineChart, color: 'text-green-600' },
      { href: '/education/alerts', label: 'Emergency Alerts', icon: ShieldAlert, color: 'text-red-500' },
      { href: '/education/inventory', label: 'Inventory', icon: Box, color: 'text-indigo-500' },
      { href: '/education/resources', label: 'Resources', icon: BookCopy, color: 'text-orange-500' },
      { href: '/education/sponsors', label: 'Sponsors', icon: Handshake, color: 'text-lime-500' },
      { href: '/education/health', label: 'Health & Safety', icon: HeartPulse, color: 'text-rose-500' },
    ]
  }
];

const topItems = [
    { href: '/education/dashboard', label: 'Dashboard', icon: BarChart, color: 'text-sky-500' },
];

const bottomItems = [
    { href: '/education/settings', label: 'Settings', icon: Settings, color: 'text-gray-500' },
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
