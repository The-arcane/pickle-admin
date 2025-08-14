
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart, Settings, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSheetContext } from '@/hooks/use-sheet-context';


const navItems = [
  { href: '/education/dashboard', label: 'Dashboard', icon: BarChart },
  // Add more education-specific navigation items here
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
