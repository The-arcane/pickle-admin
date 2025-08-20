
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart, Settings, User, Building } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSheetContext } from '@/hooks/use-sheet-context';


const navItems = [
  { href: '/sales/dashboard', label: 'Dashboard', icon: BarChart, color: 'text-sky-500' },
  { href: '/sales/organisations', label: 'Living Spaces', icon: Building, color: 'text-orange-500' },
  { href: '/sales/profile', label: 'Profile', icon: User, color: 'text-slate-500' },
  { href: '/sales/settings', label: 'Settings', icon: Settings, color: 'text-gray-500' },
];

export function SalesNav() {
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
            pathname.startsWith(item.href) && item.href !== '/sales/dashboard' && 'bg-muted text-primary',
            pathname === item.href && item.href === '/sales/dashboard' && 'bg-muted text-primary'
          )}
        >
          <item.icon className={cn("h-4 w-4", item.color)} />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
