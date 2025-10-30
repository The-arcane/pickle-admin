
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Receipt } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";

const mockInvoices = [
  { id: 'INV-2024-001', customer: 'Rohan Sharma', amount: 1200, dueDate: '2024-08-15', status: 'Paid' },
  { id: 'INV-2024-002', customer: 'Priya Kapoor', amount: 800, dueDate: '2024-08-20', status: 'Pending' },
  { id: 'INV-2024-003', customer: 'Vikram Reddy', amount: 2500, dueDate: '2024-07-30', status: 'Overdue' },
  { id: 'INV-2024-004', customer: 'Aisha Khan', amount: 500, dueDate: '2024-08-25', status: 'Pending' },
];

export default function ArenaInvoicesPage() {
  return (
    <div className="space-y-6">
        <div className="flex items-center gap-3">
            <Receipt className="h-8 w-8 text-gray-500" />
            <div>
                <h1 className="text-3xl font-bold">Invoices</h1>
                <p className="text-muted-foreground">View and manage invoices for your sports venue.</p>
            </div>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>All Invoices</CardTitle>
                <CardDescription>A record of all generated invoices.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Invoice ID</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Amount (₹)</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mockInvoices.map((invoice) => (
                            <TableRow key={invoice.id}>
                                <TableCell className="font-mono">{invoice.id}</TableCell>
                                <TableCell>{invoice.customer}</TableCell>
                                <TableCell>{invoice.amount.toLocaleString()}</TableCell>
                                <TableCell>{invoice.dueDate}</TableCell>
                                <TableCell><StatusBadge status={invoice.status} /></TableCell>
                                <TableCell className="text-right">
                                    <Button variant="outline" size="sm">
                                        <Download className="mr-2 h-4 w-4" /> Download
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
