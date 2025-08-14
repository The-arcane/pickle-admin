'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart, Settings, User, School, Users, PartyPopper, CalendarCheck, BookCopy, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSheetContext } from '@/hooks/use-sheet-context';


const navItems = [
  { href: '/education/dashboard', label: 'Dashboard', icon: BarChart },
  { href: '/education/school', label: 'School Profile', icon: School },
  { href: '/education/users', label: 'Users', icon: Users },
  { href: '/education/residences', label: 'Parents', icon: Home },
  { href: '/education/attendance', label: 'Attendance', icon: CalendarCheck },
  { href: '/education/attendance/sessions', label: 'Sessions', icon: BookCopy },
  { href: '/education/events', label: 'Events', icon: PartyPopper },
  { href: '/education/settings', label: 'Settings', icon: Settings },
];

export function EducationNav() {
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
            pathname.startsWith(item.href) && item.href !== '/education/dashboard' && 'bg-muted text-primary',
            pathname === item.href && item.href === '/education/dashboard' && 'bg-muted text-primary'
          )}
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
