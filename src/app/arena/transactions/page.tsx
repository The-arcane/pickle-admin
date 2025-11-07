
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowRightLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const mockTransactions = [
  { id: 'TXN-12345', date: '2024-08-01', description: 'Court Booking Fee (Rohan Sharma)', amount: 1200, type: 'Credit' },
  { id: 'TXN-12346', date: '2024-07-31', description: 'Event Registration (Priya Kapoor)', amount: 800, type: 'Credit' },
  { id: 'TXN-12347', date: '2024-07-30', description: 'Payout to Bank Account', amount: -5000, type: 'Debit' },
  { id: 'TXN-12348', date: '2024-07-29', description: 'Refund for cancelled booking', amount: -500, type: 'Debit' },
];

export default function ArenaTransactionsPage() {
  return (
    <div className="space-y-6">
        <div className="flex items-center gap-3">
            <ArrowRightLeft className="h-8 w-8 text-gray-500" />
            <div>
                <h1 className="text-2xl font-bold">Transactions</h1>
                <p className="text-muted-foreground">Review all financial transactions.</p>
            </div>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>A complete log of all credits and debits.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Transaction ID</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead className="text-right">Amount (₹)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mockTransactions.map((txn) => (
                            <TableRow key={txn.id}>
                                <TableCell className="font-mono">{txn.id}</TableCell>
                                <TableCell>{txn.date}</TableCell>
                                <TableCell>{txn.description}</TableCell>
                                <TableCell>
                                    <Badge variant={txn.type === 'Credit' ? 'secondary' : 'outline'} className={txn.type === 'Credit' ? 'text-green-600' : 'text-red-600'}>
                                        {txn.type}
                                    </Badge>
                                </TableCell>
                                <TableCell className={`text-right font-medium ${txn.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {txn.amount.toLocaleString()}
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
