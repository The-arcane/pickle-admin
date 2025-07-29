
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { saveChannel, deleteChannel } from './actions';
import type { Channel } from './types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Radio } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export function EditChannelClientPage({ channel }: { channel: Channel | null }) {
    const router = useRouter();
    const { toast } = useToast();
    const isAdding = !channel;
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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

    return (
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
        </form>
    );
}
