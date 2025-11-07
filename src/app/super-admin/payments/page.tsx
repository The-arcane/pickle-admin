
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Banknote } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";

const mockPayments = [
  { id: 'PAY-001', date: '2024-07-30', amount: 5000, recipient: 'Arena A', status: 'Completed' },
  { id: 'PAY-002', date: '2024-08-05', amount: 12500, recipient: 'School B', status: 'Pending' },
  { id: 'PAY-003', date: '2024-07-15', amount: 3000, recipient: 'Living Space C', status: 'Failed' },
  { id: 'PAY-004', date: '2024-08-01', amount: 7800, recipient: 'Hospitality D', status: 'Completed' },
];

export default function SuperAdminPaymentsPage() {
  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Banknote className="h-8 w-8 text-green-500" />
                <div>
                    <h1 className="text-2xl font-bold">Payments & Payouts</h1>
                    <p className="text-muted-foreground">Monitor and manage payouts to all Living Spaces.</p>
                </div>
            </div>
            <Button>Initiate Bulk Payout</Button>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Payout History</CardTitle>
                <CardDescription>A log of all past and pending payouts to organizations.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Payment ID</TableHead>
                            <TableHead>Date</TableHead>
                             <TableHead>Recipient</TableHead>
                            <TableHead>Amount (₹)</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mockPayments.map((payment) => (
                            <TableRow key={payment.id}>
                                <TableCell className="font-mono">{payment.id}</TableCell>
                                <TableCell>{payment.date}</TableCell>
                                <TableCell>{payment.recipient}</TableCell>
                                <TableCell>{payment.amount.toLocaleString()}</TableCell>
                                <TableCell><StatusBadge status={payment.status} /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  );
}
