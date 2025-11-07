
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Ticket, MessagesSquare } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import Link from "next/link";

const mockTickets = [
  { id: 'TKT-001', subject: 'Payout for July is incorrect', organisation: 'Arena A', submitted: '2 days ago', status: 'In Progress' },
  { id: 'TKT-002', subject: 'Unable to add new court', organisation: 'Living Space B', submitted: '5 days ago', status: 'Closed' },
  { id: 'TKT-003', subject: 'Question about event scheduling', organisation: 'School C', submitted: '1 week ago', status: 'Closed' },
  { id: 'TKT-004', subject: 'API access request', organisation: 'Hospitality D', submitted: '1 day ago', status: 'Open' },
];

export default function SuperAdminTicketsPage() {
  return (
    <div className="space-y-8">
        <div className="flex items-center gap-3">
            <Ticket className="h-8 w-8 text-orange-500" />
            <div>
                <h1 className="text-2xl font-bold">Support Tickets</h1>
                <p className="text-muted-foreground">Monitor and manage all support tickets across the platform.</p>
            </div>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>All Tickets</CardTitle>
                <CardDescription>A log of all support requests from all organizations.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Subject</TableHead>
                            <TableHead>Organization</TableHead>
                            <TableHead>Submitted</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mockTickets.map((ticket) => (
                            <TableRow key={ticket.id}>
                                <TableCell>
                                    <p className="font-medium">{ticket.subject}</p>
                                    <p className="text-xs text-muted-foreground font-mono">{ticket.id}</p>
                                </TableCell>
                                <TableCell>{ticket.organisation}</TableCell>
                                <TableCell>{ticket.submitted}</TableCell>
                                <TableCell>
                                    <StatusBadge status={ticket.status} />
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button asChild variant="outline" size="sm">
                                        <Link href="#">
                                            <MessagesSquare className="mr-2 h-4 w-4" />
                                            View
                                        </Link>
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
