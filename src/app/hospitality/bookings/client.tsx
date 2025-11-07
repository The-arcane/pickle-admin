
'use client';

import { useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { updateBookingStatus } from './actions';
import type { PackageBooking } from './types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, Edit, Calendar } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StatusBadge } from '@/components/status-badge';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';


const getInitials = (name: string | undefined | null) => {
  if (!name) return '';
  const names = name.split(' ').filter(Boolean);
  if (names.length > 1) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }
  return names[0]?.substring(0, 2).toUpperCase() ?? '';
};


export function BookingsClientPage({ bookings }: { bookings: PackageBooking[] }) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<PackageBooking | null>(null);
    const { toast } = useToast();

    const openEditDialog = (booking: PackageBooking) => {
        setSelectedBooking(booking);
        setIsFormOpen(true);
    };

    async function handleFormAction(formData: FormData) {
        const result = await updateBookingStatus(formData);

        if(result.error) {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        } else {
            toast({ title: 'Success', description: 'Booking updated successfully.' });
            setIsFormOpen(false);
        }
    }

    return (
        <>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Calendar className="h-8 w-8 text-rose-500" />
                    <div>
                        <h1 className="text-2xl font-bold">Package Bookings</h1>
                        <p className="text-muted-foreground">Manage all package bookings for your organization.</p>
                    </div>
                </div>
            </div>
            
            <Card>
                 <CardContent className="pt-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Package</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                             {bookings.map(booking => (
                                <TableRow key={booking.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={booking.user?.profile_image_url ?? undefined} alt={booking.user?.name ?? ''} />
                                                <AvatarFallback>{getInitials(booking.user?.name)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{booking.user?.name ?? 'N/A'}</p>
                                                <p className="text-sm text-muted-foreground">{booking.user?.email}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{booking.package?.title ?? 'N/A'}</TableCell>
                                    <TableCell>{format(new Date(booking.created_at), 'PPP')}</TableCell>
                                    <TableCell><StatusBadge status={booking.status} /></TableCell>
                                    <TableCell className="text-right">
                                         <DropdownMenu>
                                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onSelect={() => openEditDialog(booking)}><Edit className="mr-2 h-4 w-4" />Manage</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                             {bookings.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                        No package bookings found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                 </CardContent>
            </Card>
            
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Manage Booking</DialogTitle>
                        <DialogDescription>Update the status and notes for this booking.</DialogDescription>
                    </DialogHeader>
                    <form action={handleFormAction} className="space-y-4">
                        <input type="hidden" name="id" value={selectedBooking?.id} />
                        <div className="space-y-2">
                           <Label>Status</Label>
                           <Select name="status" defaultValue={selectedBooking?.status}>
                               <SelectTrigger>
                                   <SelectValue placeholder="Select a status"/>
                               </SelectTrigger>
                               <SelectContent>
                                   <SelectItem value="pending">Pending</SelectItem>
                                   <SelectItem value="confirmed">Confirmed</SelectItem>
                                   <SelectItem value="cancelled">Cancelled</SelectItem>
                                   <SelectItem value="completed">Completed</SelectItem>
                               </SelectContent>
                           </Select>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea id="notes" name="notes" defaultValue={selectedBooking?.notes ?? ''} />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                            <Button type="submit">Save Changes</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
