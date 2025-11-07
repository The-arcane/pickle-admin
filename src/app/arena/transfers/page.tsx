
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Banknote } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { Progress } from "@/components/ui/progress";

const mockTransfers = [
  { id: 'TR-001', date: '2024-07-30', amount: 5000, status: 'Completed' },
  { id: 'TR-002', date: '2024-08-05', amount: 12500, status: 'Pending' },
  { id: 'TR-003', date: '2024-07-15', amount: 3000, status: 'Failed' },
];

export default function ArenaTransfersPage() {
  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Banknote className="h-8 w-8 text-gray-500" />
                <div>
                    <h1 className="text-2xl font-bold">Transfers</h1>
                    <p className="text-muted-foreground">Manage payouts to your bank account.</p>
                </div>
            </div>
            <Button>Request Transfer</Button>
        </div>

         <Card>
            <CardHeader>
                <CardTitle>Available for Transfer</CardTitle>
                <CardDescription>Your current balance that can be transferred.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
                <p className="text-3xl font-bold">₹ 15,340.00</p>
                <p className="text-xs text-muted-foreground">Next automatic transfer is in 3 days.</p>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Transfer History</CardTitle>
                <CardDescription>A log of all your past and pending transfers.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Transfer ID</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Amount (₹)</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mockTransfers.map((transfer) => (
                            <TableRow key={transfer.id}>
                                <TableCell className="font-mono">{transfer.id}</TableCell>
                                <TableCell>{transfer.date}</TableCell>
                                <TableCell>{transfer.amount.toLocaleString()}</TableCell>
                                <TableCell><StatusBadge status={transfer.status} /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  );
}
