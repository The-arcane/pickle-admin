
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { QrCode, Calendar, PartyPopper, BarChart } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/employee/dashboard', label: 'Dashboard', icon: BarChart },
  { href: '/employee/scan', label: 'Scan QR', icon: QrCode },
  { href: '/employee/bookings', label: 'Bookings', icon: Calendar },
  { href: '/employee/events', label: 'Events', icon: PartyPopper },
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
          <item.icon className="h-4 w-4" />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
