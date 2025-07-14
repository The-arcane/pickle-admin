
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, PlusCircle, Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type Coach = {
    id: number;
    name: string;
    bio: string | null;
    profile_image: string | null;
    rating: number | null;
    sports: string;
};

function getInitials(name: string | undefined | null) {
  if (!name) return '';
  const names = name.split(' ').filter(Boolean);
  if (names.length > 1) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }
  return names[0]?.substring(0, 2).toUpperCase() ?? '';
};

export function CoachesClientPage({ initialCoaches }: { initialCoaches: Coach[] }) {
    const [coaches] = useState(initialCoaches);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Coaches</h1>
                    <p className="text-muted-foreground">Manage coaches for your organization.</p>
                </div>
                <Button asChild>
                    <Link href="/dashboard/coaches/add">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Coach
                    </Link>
                </Button>
            </div>
            <Card>
                <CardContent className="pt-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Coach</TableHead>
                                <TableHead>Specialization</TableHead>
                                <TableHead>Rating</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {coaches.length > 0 ? (
                                coaches.map((coach) => (
                                    <TableRow key={coach.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={coach.profile_image ?? undefined} alt={coach.name ?? ''} />
                                                    <AvatarFallback>{getInitials(coach.name)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{coach.name}</p>
                                                    <p className="text-sm text-muted-foreground truncate max-w-xs">{coach.bio}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{coach.sports || 'N/A'}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                {coach.rating ? <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" /> : null}
                                                {coach.rating?.toFixed(1) ?? 'N/A'}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                             <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/dashboard/coaches/${coach.id}`}>Edit</Link>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24">
                                        No coaches found.
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
