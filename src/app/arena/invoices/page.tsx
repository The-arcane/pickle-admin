
'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Download, Receipt, Eye } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import { format } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";

type Invoice = {
  id: number;
  invoice_number: string;
  user: { name: string } | null;
  total_amount: number;
  due_date: string;
  status: string;
  organisation: { name: string, address: string } | null;
  invoice_items: { description: string, total_price: number }[];
};

export default function ArenaInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchInvoices() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      
      const { data: profile } = await supabase.from('user').select('id').eq('user_uuid', user.id).single();
      if (!profile) {
        setLoading(false);
        return;
      }

      const { data: orgLink } = await supabase.from('user_organisations').select('organisation_id').eq('user_id', profile.id).single();
      if (!orgLink) {
          setLoading(false);
          return;
      }
      
      const { data: invoiceData, error } = await supabase
        .from('invoices')
        .select(`
            id, invoice_number, total_amount, due_date, status,
            user ( name ),
            organisation:organisations ( name, address ),
            invoice_items ( description, total_price )
        `)
        .eq('organisation_id', orgLink.organisation_id)
        .order('issue_date', { ascending: false });

      if (error) {
        console.error("Error fetching invoices:", error);
      } else {
        setInvoices(invoiceData as Invoice[]);
      }
      setLoading(false);
    }
    fetchInvoices();
  }, [supabase]);

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
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                        </TableRow>
                    ))
                ) : invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-mono">{invoice.invoice_number}</TableCell>
                    <TableCell>{invoice.user?.name ?? 'N/A'}</TableCell>
                    <TableCell>{invoice.total_amount.toLocaleString()}</TableCell>
                    <TableCell>{format(new Date(invoice.due_date), 'PP')}</TableCell>
                    <TableCell><StatusBadge status={invoice.status} /></TableCell>
                    <TableCell className="text-right space-x-2">
                      <Dialog>
                          <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setSelectedInvoice(invoice)}>
                                  <Eye className="mr-2 h-4 w-4" /> Preview
                              </Button>
                          </DialogTrigger>
                           {selectedInvoice && selectedInvoice.id === invoice.id && (
                            <DialogContent className="sm:max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>Invoice {selectedInvoice.invoice_number}</DialogTitle>
                                </DialogHeader>
                                <div className="p-6 border rounded-lg bg-background">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h2 className="text-xl font-bold">{selectedInvoice.organisation?.name}</h2>
                                            <p className="text-muted-foreground whitespace-pre-line">{selectedInvoice.organisation?.address}</p>
                                        </div>
                                        <div className="text-right">
                                            <h3 className="font-semibold text-lg">Invoice</h3>
                                            <p className="text-sm text-muted-foreground"># {selectedInvoice.invoice_number}</p>
                                            <p className="text-sm">Date: {format(new Date(), 'PP')}</p>
                                            <p className="text-sm">Due Date: {format(new Date(selectedInvoice.due_date), 'PP')}</p>
                                        </div>
                                    </div>
                                    <div className="mb-6">
                                        <h4 className="font-semibold mb-1">Bill To:</h4>
                                        <p>{selectedInvoice.user?.name}</p>
                                    </div>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Description</TableHead>
                                                <TableHead className="text-right">Amount</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {selectedInvoice.invoice_items.map((item, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{item.description}</TableCell>
                                                    <TableCell className="text-right">₹{item.total_price.toLocaleString()}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                    <Separator className="my-4" />
                                    <div className="flex justify-end">
                                        <div className="w-64 space-y-2">
                                            <div className="flex justify-between">
                                                <span>Subtotal</span>
                                                <span>₹{selectedInvoice.total_amount.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between font-bold text-lg">
                                                <span>Total</span>
                                                <span>₹{selectedInvoice.total_amount.toLocaleString()}</span>
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
