
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart, Settings, User, Building, Users, List, Calendar, PartyPopper, Home, ShieldCheck, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSheetContext } from '@/hooks/use-sheet-context';

const navItems = [
  { href: '/super-admin/dashboard', label: 'Dashboard', icon: BarChart },
  { href: '/super-admin/organisations', label: 'Organizations', icon: Building },
  { href: '/super-admin/users', label: 'Users', icon: Users },
  { href: '/super-admin/admins', label: 'Admins', icon: ShieldCheck },
  { href: '/super-admin/sales', label: 'Sales', icon: TrendingUp },
  { href: '/super-admin/residences', label: 'Residences', icon: Home },
  { href: '/super-admin/courts', label: 'Courts', icon: List },
  { href: '/super-admin/bookings', label: 'Bookings', icon: Calendar },
  { href: '/super-admin/events', label: 'Events', icon: PartyPopper },
  { href: '/super-admin/profile', label: 'Profile', icon: User },
  { href: '/super-admin/settings', label: 'Settings', icon: Settings },
];

export function SuperAdminNav() {
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
            pathname.startsWith(item.href) && item.href !== '/super-admin/dashboard' && 'bg-muted text-primary',
            pathname === item.href && item.href === '/super-admin/dashboard' && 'bg-muted text-primary'
          )}
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
