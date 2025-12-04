
'use client';
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Ticket, MessagesSquare } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useCallback } from "react";
import { useOrganization } from "@/hooks/use-organization";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

type Ticket = {
  id: number;
  subject: string;
  organisation: { name: string } | null;
  created_at: string;
  status: string;
  priority: string;
}

export default function SuperAdminTicketsPage() {
    const supabase = createClient();
    const { selectedOrgId } = useOrganization();
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTickets = useCallback(async () => {
        setLoading(true);
        let query = supabase.from('tickets').select('id, subject, created_at, status, priority, organisation:organisation_id(name)');
        
        if (selectedOrgId) {
            query = query.eq('organisation_id', selectedOrgId);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching tickets:", error);
            setTickets([]);
        } else {
            setTickets(data as Ticket[] || []);
        }
        setLoading(false);
    }, [supabase, selectedOrgId]);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);


  return (
    <div className="space-y-6">
        <PageHeader title="Support Tickets" description="Monitor and manage all support tickets across the platform." />

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
                            <TableHead className="hidden md:table-cell">Organization</TableHead>
                            <TableHead className="hidden sm:table-cell">Submitted</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            Array.from({length: 3}).map((_, i) => (
                                <TableRow key={`skel-${i}`}>
                                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                                    <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                                    <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                                </TableRow>
                            ))
                        ) : tickets.length > 0 ? (
                            tickets.map((ticket) => (
                            <TableRow key={ticket.id}>
                                <TableCell>
                                    <p className="font-medium">{ticket.subject}</p>
                                    <p className="text-xs text-muted-foreground font-mono">{ticket.id}</p>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">{ticket.organisation?.name ?? 'N/A'}</TableCell>
                                <TableCell className="hidden sm:table-cell">{formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}</TableCell>
                                <TableCell>
                                    <StatusBadge status={ticket.status} />
                                </TableCell>
                                <TableCell>
                                    <StatusBadge status={ticket.priority} />
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={`/super-admin/tickets/${ticket.id}`}>
                                            <MessagesSquare className="mr-2 h-4 w-4" />
                                            View
                                        </Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">No tickets found for the selected organization.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  );
}
