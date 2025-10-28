
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart, Settings, User, Building, Users, List, Calendar, PartyPopper, Home, ShieldCheck, TrendingUp, School, Hotel } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSheetContext } from '@/hooks/use-sheet-context';

const navItems = [
  { href: '/super-admin/dashboard', label: 'Dashboard', icon: BarChart, color: 'text-sky-500' },
  { href: '/super-admin/organisations', label: 'Living Spaces', icon: Building, color: 'text-orange-500' },
  { href: '/super-admin/schools', label: 'Schools', icon: School, color: 'text-blue-500' },
  { href: '/super-admin/hospitality', label: 'Hospitality', icon: Hotel, color: 'text-purple-500' },
  { href: '/super-admin/users', label: 'Users', icon: Users, color: 'text-violet-500' },
  { href: '/super-admin/admins', label: 'Admins', icon: ShieldCheck, color: 'text-red-500' },
  { href: '/super-admin/sales', label: 'Sales', icon: TrendingUp, color: 'text-green-500' },
  { href: '/super-admin/invitations', label: 'Invitations', icon: Home, color: 'text-teal-500' },
  { href: '/super-admin/courts', label: 'Courts', icon: List, color: 'text-amber-500' },
  { href: '/super-admin/bookings', label: 'Bookings', icon: Calendar, color: 'text-rose-500' },
  { href: '/super-admin/events', label: 'Events', icon: PartyPopper, color: 'text-pink-500' },
  { href: '/super-admin/profile', label: 'Profile', icon: User, color: 'text-slate-500' },
  { href: '/super-admin/settings', label: 'Settings', icon: Settings, color: 'text-gray-500' },
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
          <item.icon className={cn("h-4 w-4", item.color)} />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
