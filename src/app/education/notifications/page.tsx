
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Megaphone, PlusCircle, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Mock Data for Notifications
const mockNotifications = [
  {
    id: 'notif_001',
    event: 'Annual Pickleball Championship',
    type: 'Initial Alert',
    channel: 'Email, Push',
    scheduledTime: new Date(new Date().setDate(new Date().getDate() + 5)),
    status: 'Scheduled',
  },
  {
    id: 'notif_002',
    event: 'Friendly Match vs. Green Aces',
    type: 'Post-Match Summary',
    channel: 'SMS',
    scheduledTime: new Date(new Date().setDate(new Date().getDate() - 2)),
    status: 'Sent',
  },
  {
    id: 'notif_003',
    event: 'Intra-School League - Week 2',
    type: 'Reminder',
    channel: 'Push',
    scheduledTime: new Date(new Date().setHours(new Date().getHours() - 1)),
    status: 'Sent',
  },
];

const getStatusColor = (status: string) => {
    switch (status) {
        case 'Scheduled': return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/20';
        case 'Sent': return 'bg-green-500/20 text-green-700 border-green-500/20';
        case 'Draft': return 'bg-gray-500/20 text-gray-700 border-gray-500/20';
        default: return 'secondary';
    }
}


export default function NotificationsListPage() {
  const [notifications, setNotifications] = useState(mockNotifications);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Megaphone className="h-8 w-8 text-yellow-500" />
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="text-muted-foreground">Manage and schedule communications for all events.</p>
          </div>
        </div>
        <Button asChild>
          <Link href="/education/notifications/add">
            <PlusCircle className="mr-2 h-4 w-4" /> Create Notification
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scheduled & Sent Notifications</CardTitle>
          <CardDescription>A log of all automated and manual communications.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead className="hidden md:table-cell">Type</TableHead>
                <TableHead className="hidden sm:table-cell">Channel(s)</TableHead>
                <TableHead className="hidden sm:table-cell">Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notifications.length > 0 ? (
                notifications.map((notif) => (
                  <TableRow key={notif.id}>
                    <TableCell className="font-medium">{notif.event}</TableCell>
                    <TableCell className="hidden md:table-cell">{notif.type}</TableCell>
                    <TableCell className="hidden sm:table-cell">{notif.channel}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {format(notif.scheduledTime, 'MMM d, yyyy p')}
                    </TableCell>
                    <TableCell>
                        <Badge variant="outline" className={getStatusColor(notif.status)}>{notif.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                    <Link href={`/education/notifications/${notif.id}`}><Edit className="mr-2 h-4 w-4" />Edit</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive focus:text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No notifications created yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
