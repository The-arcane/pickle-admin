'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookCopy, Home, Landmark, Settings, Users } from 'lucide-react';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/dashboard/bookings', label: 'Bookings', icon: BookCopy },
  { href: '/dashboard/users', label: 'Users', icon: Users },
  { href: '/dashboard/courts', label: 'Courts', icon: Landmark },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <Link href={item.href} legacyBehavior passHref>
            <SidebarMenuButton
              isActive={pathname === item.href}
              className={cn('w-full justify-start')}
              asChild
            >
              <a>
                <item.icon className="mr-2 h-4 w-4" />
                <span>{item.label}</span>
              </a>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
