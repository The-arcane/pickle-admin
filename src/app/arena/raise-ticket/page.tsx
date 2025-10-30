
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Ticket, Paperclip } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";

const mockTickets = [
  { id: 'TKT-001', subject: 'Payout for July is incorrect', submitted: '2 days ago', status: 'In Progress' },
  { id: 'TKT-002', subject: 'Unable to add new court', submitted: '5 days ago', status: 'Closed' },
  { id: 'TKT-003', subject: 'Question about event scheduling', submitted: '1 week ago', status: 'Closed' },
];

export default function RaiseTicketPage() {
  return (
    <div className="space-y-8">
        <div className="flex items-center gap-3">
            <Ticket className="h-8 w-8 text-orange-500" />
            <div>
                <h1 className="text-3xl font-bold">Raise a Ticket</h1>
                <p className="text-muted-foreground">Submit a support request to our team.</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>New Support Ticket</CardTitle>
                    <CardDescription>Describe your issue below and we'll get back to you as soon as possible.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input id="subject" placeholder="e.g., Issue with a booking" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="priority">Priority</Label>
                        <Select>
                            <SelectTrigger id="priority">
                                <SelectValue placeholder="Select a priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" placeholder="Please provide as much detail as possible..." rows={6} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="attachment">Attachment</Label>
                        <Input id="attachment" type="file" />
                        <p className="text-xs text-muted-foreground">Optional: Attach a screenshot or relevant file.</p>
                    </div>
                    <Button className="w-full">Submit Ticket</Button>
                </CardContent>
            </Card>

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
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockTickets.map((ticket) => (
                                <TableRow key={ticket.id}>
                                    <TableCell>
                                        <p className="font-medium">{ticket.subject}</p>
                                        <p className="text-xs text-muted-foreground">{ticket.id} &middot; {ticket.submitted}</p>
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge status={ticket.status} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
