
'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Download, Receipt, Eye } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { Separator } from "@/components/ui/separator";

const mockInvoices = [
  { id: 'INV-2024-001', customer: 'Rohan Sharma', amount: 1200, dueDate: '2024-08-15', status: 'Paid', items: [{ description: 'Court Booking - Court A (2 hours)', price: 1200 }] },
  { id: 'INV-2024-002', customer: 'Priya Kapoor', amount: 800, dueDate: '2024-08-20', status: 'Pending', items: [{ description: 'Event Fee - Summer Tournament', price: 800 }] },
  { id: 'INV-2024-003', customer: 'Vikram Reddy', amount: 2500, dueDate: '2024-07-30', status: 'Overdue', items: [{ description: 'Monthly Coaching - Adv. Level', price: 2500 }] },
  { id: 'INV-2024-004', customer: 'Aisha Khan', amount: 500, dueDate: '2024-08-25', status: 'Pending', items: [{ description: 'Equipment Rental - 1 Paddle', price: 500 }] },
];

type Invoice = typeof mockInvoices[0];

export default function ArenaInvoicesPage() {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Receipt className="h-8 w-8 text-gray-500" />
          <div>
            <h1 className="text-2xl font-bold">Invoices</h1>
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
                    <TableCell className="text-right space-x-2">
                      <Dialog>
                          <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setSelectedInvoice(invoice)}>
                                  <Eye className="mr-2 h-4 w-4" /> Preview
                              </Button>
                          </DialogTrigger>
                          {selectedInvoice && (
                            <DialogContent className="sm:max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>Invoice {selectedInvoice.id}</DialogTitle>
                                </DialogHeader>
                                <div className="p-6 border rounded-lg bg-background">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h2 className="text-xl font-bold">Arena Sports Complex</h2>
                                            <p className="text-muted-foreground">123 Sports Lane, Mumbai, MH 400001</p>
                                        </div>
                                        <div className="text-right">
                                            <h3 className="font-semibold text-lg">Invoice</h3>
                                            <p className="text-sm text-muted-foreground"># {selectedInvoice.id}</p>
                                            <p className="text-sm">Date: {new Date().toLocaleDateString()}</p>
                                            <p className="text-sm">Due Date: {selectedInvoice.dueDate}</p>
                                        </div>
                                    </div>
                                    <div className="mb-6">
                                        <h4 className="font-semibold mb-1">Bill To:</h4>
                                        <p>{selectedInvoice.customer}</p>
                                    </div>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Description</TableHead>
                                                <TableHead className="text-right">Amount</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {selectedInvoice.items.map((item, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{item.description}</TableCell>
                                                    <TableCell className="text-right">₹{item.price.toLocaleString()}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                    <Separator className="my-4" />
                                    <div className="flex justify-end">
                                        <div className="w-64 space-y-2">
                                            <div className="flex justify-between">
                                                <span>Subtotal</span>
                                                <span>₹{selectedInvoice.amount.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between font-bold text-lg">
                                                <span>Total</span>
                                                <span>₹{selectedInvoice.amount.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </DialogContent>
                          )}
                      </Dialog>
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
    </>
  );
}
