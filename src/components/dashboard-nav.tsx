'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart, Calendar, List, Settings, User, Users } from 'lucide-react';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: BarChart },
  { href: '/dashboard/bookings', label: 'Bookings', icon: Calendar },
  { href: '/dashboard/users', label: 'Users', icon: Users },
  { href: '/dashboard/courts', label: 'Court List', icon: List },
  { href: '/dashboard/profile', label: 'Admin Profile', icon: User },
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
              className={cn(
                'w-full justify-start',
                pathname === item.href && "bg-card text-primary border border-primary hover:bg-card"
              )}
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
