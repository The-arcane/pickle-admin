
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart, Settings, User, School, Users, PartyPopper, CalendarCheck, BookCopy, Home, Megaphone, MessageSquare, LineChart, Trophy, FileText, Image as ImageIcon, Calendar as CalendarIcon, ShieldAlert, Box, Handshake, HeartPulse } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSheetContext } from '@/hooks/use-sheet-context';


const navItems = [
  { href: '/education/dashboard', label: 'Dashboard', icon: BarChart },
  { href: '/education/attendance', label: 'Attendance', icon: CalendarCheck },
  { href: '/education/events', label: 'Events', icon: PartyPopper },
  { href: '/education/notifications', label: 'Notifications', icon: Megaphone },
  { href: '/education/communication', label: 'Communication', icon: MessageSquare },
  { href: '/education/reports', label: 'Reports', icon: LineChart },
  { href: '/education/season', label: 'Season', icon: Trophy },
  { href: '/education/media', label: 'Media', icon: ImageIcon },
  { href: '/education/users', label: 'Admin Users', icon: Users },
  { href: '/education/calendar', label: 'Calendar', icon: CalendarIcon },
  { href: '/education/alerts', label: 'Emergency Alerts', icon: ShieldAlert },
  { href: '/education/skills', label: 'Skills', icon: Trophy },
  { href: '/education/inventory', label: 'Inventory', icon: Box },
  { href: '/education/resources', label: 'Resources', icon: BookCopy },
  { href: '/education/sponsors', label: 'Sponsors', icon: Handshake },
  { href: '/education/health', label: 'Health & Safety', icon: HeartPulse },
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
