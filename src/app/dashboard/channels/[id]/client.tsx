
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { saveChannel, deleteChannel, inviteMembers, removeMember } from './actions';
import type { Channel, ChannelMember, User } from './types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Radio, PlusCircle, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogClose, DialogFooter, DialogDescription, DialogHeader, DialogTitle, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';

function getInitials(name: string | undefined | null) {
  if (!name) return '';
  const names = name.split(' ').filter(Boolean);
  if (names.length > 1) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }
  return names[0]?.substring(0, 2).toUpperCase() ?? '';
};


export function EditChannelClientPage({ channel, members, users }: { channel: Channel | null, members: ChannelMember[], users: User[] }) {
    const router = useRouter();
    const { toast } = useToast();
    const isAdding = !channel;
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

    const handleFormAction = async (formData: FormData) => {
        const result = await saveChannel(formData);
        if (result?.error) {
            toast({ variant: "destructive", title: "Error", description: result.error });
        } else {
            toast({ title: "Success", description: `Channel ${isAdding ? 'created' : 'updated'} successfully.` });
        }
    };

    const handleDeleteAction = async () => {
        if (!channel) return;
        const formData = new FormData();
        formData.append('id', channel.id);
        const result = await deleteChannel(formData);
        if (result?.error) {
            toast({ variant: "destructive", title: "Error", description: result.error });
        } else {
            toast({ title: "Success", description: `Channel deleted.` });
        }
        setIsDeleteDialogOpen(false);
    };

    const handleInviteAction = async () => {
        if (!channel || selectedUsers.length === 0) return;
        const result = await inviteMembers(channel.id, selectedUsers);
        if(result?.error) {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        } else {
            toast({ title: 'Success', description: 'Members invited successfully.' });
            setSelectedUsers([]);
        }
    };

    const handleRemoveMemberAction = async (invitationId: number) => {
        const result = await removeMember(invitationId);
         if(result?.error) {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        } else {
            toast({ title: 'Success', description: 'Member removed.' });
        }
    };

    const availableUsersToInvite = users.filter(u => !members.some(m => m.invited_user_id === u.id));

    return (
        <div className="space-y-8">
            <form action={handleFormAction} className="space-y-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Radio className="h-8 w-8 text-indigo-500" />
                        <div>
                            <h1 className="text-3xl font-bold">{isAdding ? 'Add New Channel' : 'Edit Channel'}</h1>
                            <p className="text-muted-foreground">{isAdding ? 'Create a new channel for your organization.' : 'Update the channel details.'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" type="button" asChild><Link href="/dashboard/channels">Cancel</Link></Button>
                        <Button type="submit">Save Changes</Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Channel Information</CardTitle>
                        <CardDescription>Basic details for the communication channel.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {channel && <input type="hidden" name="id" value={channel.id} />}
                        <div className="space-y-2">
                            <Label htmlFor="name">Channel Name</Label>
                            <Input id="name" name="name" defaultValue={channel?.name ?? ''} placeholder="e.g., General Discussion" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" name="description" defaultValue={channel?.description ?? ''} placeholder="What is this channel about?" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="type">Type</Label>
                                <Select name="type" defaultValue={channel?.type || 'community'}>
                                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="community">Community</SelectItem>
                                        <SelectItem value="announcement">Announcement</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="visibility">Visibility</Label>
                                <Select name="visibility" defaultValue={channel?.visibility || 'public'}>
                                    <SelectTrigger><SelectValue placeholder="Select visibility" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="public">Public</SelectItem>
                                        <SelectItem value="private">Private</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </form>
            
            {!isAdding && (
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Channel Members</CardTitle>
                            <CardDescription>Users who have been invited to this channel.</CardDescription>
                        </div>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button><PlusCircle className="mr-2 h-4 w-4" /> Invite Members</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Invite Members</DialogTitle>
                                    <DialogDescription>Select users to invite to this channel.</DialogDescription>
                                </DialogHeader>
                                <ScrollArea className="h-72">
                                    <div className="space-y-4 pr-6">
                                    {availableUsersToInvite.map(user => (
                                        <div key={user.id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                 <Avatar className="h-8 w-8">
                                                    <AvatarImage src={user.profile_image_url ?? undefined} alt={user.name ?? ''} />
                                                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                                </Avatar>
                                                <p className="font-medium">{user.name}</p>
                                            </div>
                                            <Checkbox
                                                checked={selectedUsers.includes(user.id)}
                                                onCheckedChange={(checked) => {
                                                    setSelectedUsers(prev => 
                                                        checked
                                                        ? [...prev, user.id]
                                                        : prev.filter(id => id !== user.id)
                                                    );
                                                }}
                                            />
                                        </div>
                                    ))}
                                    </div>
                                </ScrollArea>
                                 <DialogFooter>
                                    <DialogClose asChild>
                                        <Button type="button" variant="outline">Cancel</Button>
                                    </DialogClose>
                                    <DialogClose asChild>
                                        <Button onClick={handleInviteAction} disabled={selectedUsers.length === 0}>Invite</Button>
                                    </DialogClose>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {members.length > 0 ? members.map(member => (
                                <div key={member.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={member.user?.profile_image_url ?? undefined} alt={member.user?.name ?? ''} />
                                            <AvatarFallback>{getInitials(member.user?.name)}</AvatarFallback>
                                        </Avatar>
                                        <p className="font-medium">{member.user?.name}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Badge variant="outline" className="capitalize">{member.status}</Badge>
                                        <Button variant="ghost" size="icon" onClick={() => handleRemoveMemberAction(member.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-sm text-muted-foreground text-center py-4">No members have been invited yet.</p>
                            )}
                        </div>
                    </CardContent>
                 </Card>
            )}


            {!isAdding && (
                 <Card className="border-destructive">
                    <CardHeader>
                        <CardTitle>Danger Zone</CardTitle>
                        <CardDescription>This action cannot be undone.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button type="button" variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>Delete Channel</Button>
                    </CardContent>
                </Card>
            )}

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>This will permanently delete the channel and all its messages. This action cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAction} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
