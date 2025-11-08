
import { createServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatDistanceToNow } from 'date-fns';
import { RaiseTicketForm } from "@/app/arena/raise-ticket/form";
import { Ticket, MessagesSquare } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function LivingspaceRaiseTicketPage() {
    const supabase = await createServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return redirect('/login');
    }

    const { data: userProfile } = await supabase.from('user').select('id, user_organisations(organisation_id)').eq('user_uuid', user.id).single();
    if (!userProfile) {
        return <p className="text-muted-foreground">Could not find your user profile.</p>;
    }
    const organisationId = userProfile.user_organisations[0]?.organisation_id;
    if (!organisationId) {
        return <p className="text-muted-foreground">You are not associated with an organization.</p>;
    }

    const { data: tickets, error } = await supabase
        .from('tickets')
        .select('id, subject, created_at, status, priority')
        .eq('user_id', userProfile.id)
        .order('created_at', { ascending: false })
        .limit(10);
    
    if (error) {
        console.error("Error fetching tickets:", error);
    }

  return (
    <div className="space-y-8">
        <div className="flex items-center gap-3">
            <Ticket className="h-8 w-8 text-orange-500" />
            <div>
                <h1 className="text-2xl font-bold">Raise a Ticket</h1>
                <p className="text-muted-foreground">Submit a support request to our team.</p>
            </div>
        </div>

        <div className="space-y-8">
            <RaiseTicketForm organisationId={organisationId} />

             <Card>
                <CardHeader>
                    <CardTitle>Recent Tickets</CardTitle>
                    <CardDescription>A list of your most recent support requests.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Subject</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Priority</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tickets && tickets.length > 0 ? (
                                tickets.map((ticket) => (
                                <TableRow key={ticket.id}>
                                    <TableCell>
                                        <p className="font-medium">{ticket.subject}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {`#${ticket.id}`} &middot; {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
                                        </p>
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge status={ticket.status} />
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge status={ticket.priority} />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={`/livingspace/raise-ticket/${ticket.id}`}>
                                                <MessagesSquare className="mr-2 h-4 w-4" />
                                                View History
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">No recent tickets found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
