'use client';
import { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Pencil } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { updateUser } from './actions';
import type { User } from '@/types';


type UserWithRole = {
    role: { name: string } | null;
    user: User & {is_deleted: boolean} | null;
}

export function UsersClientPage({ users, loading }: { users: UserWithRole[], loading: boolean }) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithRole['user'] | null>(null);
  const { toast } = useToast();

  const getInitials = (name: string | undefined) => {
    if (!name) return '';
    const names = name.split(' ');
    const initials = names.map(n => n[0]).join('');
    return initials.toUpperCase();
  }

  const handleEditClick = (user: UserWithRole['user']) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const handleFormAction = async (formData: FormData) => {
    const result = await updateUser(formData);
    if (result.error) {
        toast({
            variant: "destructive",
            title: "Error",
            description: result.error,
        });
    } else {
        toast({
            title: "Success",
            description: "User updated successfully.",
        });
        setIsEditDialogOpen(false);
        setSelectedUser(null);
    }
  }

  return (
    <>
      <PageHeader
        title="Users"
        description="Manage all users for the selected organization."
      />
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-9 w-9 rounded-full" />
                      <div className="grid gap-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : users.length > 0 ? (
              users.map((item) => {
                const user = item.user;
                if (!user) return null;

                return (
                    <TableRow key={user.id}>
                    <TableCell>
                        <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                            <AvatarImage src={user.profile_image_url || undefined} alt="Avatar" data-ai-hint="avatar" />
                            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                        </Avatar>
                        <div className="grid gap-0.5">
                            <span className="font-medium">{user.name}</span>
                            <span className="text-xs text-muted-foreground">
                            {user.email}
                            </span>
                        </div>
                        </div>
                    </TableCell>
                    <TableCell>
                        <Badge variant={item.role?.name === 'Admin' ? 'default' : 'secondary'} className='capitalize'>{item.role?.name ?? 'User'}</Badge>
                    </TableCell>
                    <TableCell>{format(new Date(user.created_at), 'PP')}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEditClick(user)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit user</span>
                      </Button>
                    </TableCell>
                    </TableRow>
                )
            })
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No users found for this organization.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {selectedUser && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
            </DialogHeader>
            <form action={handleFormAction}>
              <input type="hidden" name="id" value={selectedUser.id} />
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" name="name" defaultValue={selectedUser.name} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" defaultValue={selectedUser.email} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" name="phone" defaultValue={selectedUser.phone ?? ''} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select name="status" defaultValue={selectedUser.is_deleted ? 'Inactive' : 'Active'}>
                        <SelectTrigger id="status">
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
