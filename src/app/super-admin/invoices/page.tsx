

'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Receipt, Eye } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";

const mockInvoices = [
  { id: 'INV-A-001', customer: 'Rohan Sharma', organisation: 'Arena A', amount: 1200, dueDate: '2024-08-15', status: 'Paid' },
  { id: 'INV-S-002', customer: 'Priya Kapoor', organisation: 'School B', amount: 800, dueDate: '2024-08-20', status: 'Pending' },
  { id: 'INV-R-003', customer: 'Vikram Reddy', organisation: 'Living Space C', amount: 2500, dueDate: '2024-07-30', status: 'Overdue' },
  { id: 'INV-H-004', customer: 'Aisha Khan', organisation: 'Hospitality D', amount: 500, dueDate: '2024-08-25', status: 'Pending' },
];

export default function SuperAdminInvoicesPage() {
  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Receipt className="h-8 w-8 text-gray-500" />
          <div>
            <h1 className="text-2xl font-bold">Invoices</h1>
            <p className="text-muted-foreground">View and manage invoices across all organizations.</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Platform Invoices</CardTitle>
            <CardDescription>A record of all invoices generated across the platform.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead className="hidden sm:table-cell">Organization</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount (₹)</TableHead>
                  <TableHead className="hidden md:table-cell">Due Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-mono">{invoice.id}</TableCell>
                    <TableCell className="hidden sm:table-cell">{invoice.organisation}</TableCell>
                    <TableCell>{invoice.customer}</TableCell>
                    <TableCell>{invoice.amount.toLocaleString()}</TableCell>
                    <TableCell className="hidden md:table-cell">{invoice.dueDate}</TableCell>
                    <TableCell><StatusBadge status={invoice.status} /></TableCell>
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
