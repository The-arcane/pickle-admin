

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowRightLeft, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const mockTransactions = [
  { id: 'TXN-00A1', date: '2024-08-01', description: 'Court Booking Fee (Arena A)', amount: 1200, type: 'Credit' },
  { id: 'TXN-00B2', date: '2024-07-31', description: 'Event Registration (School B)', amount: 800, type: 'Credit' },
  { id: 'TXN-00C3', date: '2024-07-30', description: 'Payout to Arena A', amount: -5000, type: 'Debit' },
  { id: 'TXN-00D4', date: '2024-07-29', description: 'Refund for cancelled booking', amount: -500, type: 'Debit' },
  { id: 'TXN-00E5', date: '2024-07-28', description: 'Platform Fee (Living Space C)', amount: 1500, type: 'Credit' },
];

export default function SuperAdminTransactionsPage() {
  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                <ArrowRightLeft className="h-8 w-8 text-gray-500" />
                <div>
                    <h1 className="text-2xl font-bold">Transactions</h1>
                    <p className="text-muted-foreground">Review all financial transactions across the platform.</p>
                </div>
            </div>
            <Button variant="outline" className="w-full sm:w-auto"><Download className="mr-2 h-4 w-4" /> Export Report</Button>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Platform Transaction History</CardTitle>
                <CardDescription>A complete log of all credits and debits from all Living Spaces.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Transaction ID</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="hidden sm:table-cell">Description</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead className="text-right">Amount (₹)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mockTransactions.map((txn) => (
                            <TableRow key={txn.id}>
                                <TableCell className="font-mono">{txn.id}</TableCell>
                                <TableCell>{txn.date}</TableCell>
                                <TableCell className="hidden sm:table-cell">{txn.description}</TableCell>
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
