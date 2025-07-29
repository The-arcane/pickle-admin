
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart, Calendar, List, Settings, User, Users, PartyPopper, Home, Briefcase, Contact2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: BarChart, color: 'text-sky-500' },
  { href: '/dashboard/bookings', label: 'Bookings', icon: Calendar, color: 'text-green-500' },
  { href: '/dashboard/users', label: 'Users', icon: Users, color: 'text-violet-500' },
  { href: '/dashboard/employees', label: 'Employees', icon: Briefcase, color: 'text-orange-500' },
  { href: '/dashboard/residences', label: 'Residences', icon: Home, color: 'text-teal-500' },
  { href: '/dashboard/courts', label: 'Court List', icon: List, color: 'text-amber-500' },
  { href: '/dashboard/coaches', label: 'Coaches', icon: Contact2, color: 'text-rose-500' },
  { href: '/dashboard/events', label: 'Events', icon: PartyPopper, color: 'text-pink-500' },
  { href: '/dashboard/profile', label: 'Admin Profile', icon: User, color: 'text-slate-500' },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings, color: 'text-gray-500' },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="grid items-start gap-1 px-4 text-sm font-medium">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
            pathname.startsWith(item.href) && item.href !== '/dashboard' && 'bg-muted text-primary',
            pathname === item.href && item.href === '/dashboard' && 'bg-muted text-primary'
          )}
        >
          <item.icon className={cn("h-4 w-4", item.color)} />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
