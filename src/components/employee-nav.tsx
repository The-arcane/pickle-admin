
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { QrCode, Calendar, PartyPopper } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from './ui/button';

const navItems = [
  { href: '/employee/scan', label: 'Scan QR', icon: QrCode },
  { href: '/employee/bookings', label: 'Bookings', icon: Calendar },
  { href: '/employee/events', label: 'Events', icon: PartyPopper },
];

export function EmployeeNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-2 text-sm font-medium">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            buttonVariants({ variant: 'ghost', size: 'sm' }),
            'flex items-center gap-2 px-3 py-2 text-muted-foreground transition-all hover:text-primary',
            pathname === item.href && 'bg-muted text-primary'
          )}
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
