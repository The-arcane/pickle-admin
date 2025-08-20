
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { QrCode, Calendar, PartyPopper, BarChart, User, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/employee/dashboard', label: 'Dashboard', icon: BarChart, color: 'text-sky-500' },
  { href: '/employee/scan', label: 'Scan QR', icon: QrCode, color: 'text-teal-500' },
  { href: '/employee/bookings', label: 'Bookings', icon: Calendar, color: 'text-green-500' },
  { href: '/employee/events', label: 'Events', icon: PartyPopper, color: 'text-pink-500' },
  { href: '/employee/profile', label: 'Profile', icon: User, color: 'text-slate-500' },
  { href: '/employee/settings', label: 'Settings', icon: Settings, color: 'text-gray-500' },
];

export function EmployeeNav() {
  const pathname = usePathname();

  return (
    <nav className="grid items-start gap-1 px-4 text-sm font-medium">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
            pathname.startsWith(item.href) && item.href !== '/employee/dashboard' && 'bg-muted text-primary',
            pathname === item.href && item.href === '/employee/dashboard' && 'bg-muted text-primary'
          )}
        >
          <item.icon className={cn("h-4 w-4", item.color)} />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
