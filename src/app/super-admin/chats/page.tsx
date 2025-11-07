
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MessageSquare, Eye } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const mockChats = [
  { id: 'CHAT-001', userName: 'Rohan Sharma', userAvatar: '', orgName: 'Arena A', lastMessage: 'Thanks for your help!', status: 'Closed', lastUpdate: '2 hours ago' },
  { id: 'CHAT-002', userName: 'Admin @ School B', userAvatar: '', orgName: 'School B', lastMessage: 'I still see the issue on my end.', status: 'Open', lastUpdate: '15 minutes ago' },
  { id: 'CHAT-003', userName: 'Priya Kapoor', userAvatar: '', orgName: 'Living Space C', lastMessage: 'Okay, I will try that.', status: 'Open', lastUpdate: '1 day ago' },
];

export default function SuperAdminChatsPage() {
  return (
    <div className="space-y-8">
        <div className="flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-blue-500" />
            <div>
                <h1 className="text-2xl font-bold">Live Chats</h1>
                <p className="text-muted-foreground">Review transcripts of support chats.</p>
            </div>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Chat History</CardTitle>
                <CardDescription>A log of all support chat conversations.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Organization</TableHead>
                            <TableHead>Last Message</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mockChats.map((chat) => (
                            <TableRow key={chat.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback>{chat.userName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span className="font-medium">{chat.userName}</span>
                                    </div>
                                </TableCell>
                                <TableCell>{chat.orgName}</TableCell>
                                <TableCell>
                                    <p className="max-w-xs truncate text-muted-foreground">{chat.lastMessage}</p>
                                </TableCell>
                                <TableCell>
                                    <StatusBadge status={chat.status} />
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="outline" size="sm">
                                        <Eye className="mr-2 h-4 w-4" /> View Transcript
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  );
}
