
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, PlusCircle, Edit, Trash2, Globe, Lock } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

type Channel = {
    id: string;
    name: string;
    description: string | null;
    visibility: 'public' | 'private';
    type: string;
    created_at: string;
    created_by: { name: string, profile_image_url: string | null } | null;
};

function getInitials(name: string | undefined | null) {
  if (!name) return '';
  const names = name.split(' ').filter(Boolean);
  if (names.length > 1) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }
  return names[0]?.substring(0, 2).toUpperCase() ?? '';
};

export function ChannelsClientPage({ initialChannels }: { initialChannels: Channel[] }) {
    const [channels] = useState(initialChannels);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-end">
                <Button asChild>
                    <Link href="/dashboard/channels/add">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Channel
                    </Link>
                </Button>
            </div>
            <Card>
                <CardContent className="pt-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Channel</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Visibility</TableHead>
                                <TableHead>Created By</TableHead>
                                <TableHead>Created At</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {channels.length > 0 ? (
                                channels.map((channel) => (
                                    <TableRow key={channel.id}>
                                        <TableCell>
                                            <p className="font-medium">{channel.name}</p>
                                            <p className="text-sm text-muted-foreground truncate max-w-xs">{channel.description}</p>
                                        </TableCell>
                                        <TableCell><Badge variant="outline" className="capitalize">{channel.type}</Badge></TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {channel.visibility === 'public' ? <Globe className="h-4 w-4 text-green-500" /> : <Lock className="h-4 w-4 text-red-500" />}
                                                <span className="capitalize">{channel.visibility}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={channel.created_by?.profile_image_url ?? undefined} alt={channel.created_by?.name ?? ''} />
                                                    <AvatarFallback>{getInitials(channel.created_by?.name)}</AvatarFallback>
                                                </Avatar>
                                                <p className="font-medium">{channel.created_by?.name}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>{format(new Date(channel.created_at), 'PP')}</TableCell>
                                        <TableCell className="text-right">
                                             <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/dashboard/channels/${channel.id}`}>Edit</Link>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24">
                                        No channels found.
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
