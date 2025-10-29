
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart, Settings, Calendar, PartyPopper, Users, List, Contact2, Radio, User, Building } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSheetContext } from '@/hooks/use-sheet-context';

const navItems = [
  { href: '/arena/dashboard', label: 'Dashboard', icon: BarChart, color: 'text-sky-500' },
  { href: '/arena/bookings', label: 'Bookings', icon: Calendar, color: 'text-rose-500' },
  { href: '/arena/events', label: 'Events', icon: PartyPopper, color: 'text-pink-500' },
  { href: '/arena/members', label: 'Members', icon: Users, color: 'text-violet-500' },
  { href: '/arena/courts', label: 'Courts', icon: List, color: 'text-amber-500' },
  { href: '/arena/coaches', label: 'Coaches', icon: Contact2, color: 'text-rose-500' },
  { href: '/arena/channels', label: 'Channels', icon: Radio, color: 'text-indigo-500' },
  { href: '/arena/organisations', label: 'Sports Venue', icon: Building, color: 'text-orange-500' },
  { href: '/arena/profile', label: 'Profile', icon: User, color: 'text-slate-500' },
  { href: '/arena/settings', label: 'Settings', icon: Settings, color: 'text-gray-500' },
];

export function ArenaNav() {
  const pathname = usePathname();
  const { setOpen } = useSheetContext();

  return (
    <nav className="grid items-start gap-1 px-4 text-sm font-medium">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => setOpen && setOpen(false)}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
            pathname.startsWith(item.href) && item.href !== '/arena/dashboard' && 'bg-muted text-primary',
            pathname === item.href && item.href === '/arena/dashboard' && 'bg-muted text-primary'
          )}
        >
          <item.icon className={cn("h-4 w-4", item.color)} />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
