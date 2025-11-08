
import { createServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowRightLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';

export default async function ArenaTransactionsPage() {
    const supabase = await createServer();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return redirect('/login?type=arena');
    }

    const { data: userProfile } = await supabase.from('user').select('id').eq('user_uuid', user.id).single();
    if (!userProfile) {
        return redirect('/login?type=arena&error=User%20profile%20not%20found.');
    }

    const { data: orgLink } = await supabase.from('user_organisations').select('organisation_id').eq('user_id', userProfile.id).single();
    if (!orgLink?.organisation_id) {
        return <p>You are not associated with an organization.</p>;
    }
    
    const { data: transactions, error } = await supabase
        .from('ledger_entries')
        .select('*')
        .eq('organisation_id', orgLink.organisation_id)
        .order('created_at', { ascending: false });

    if(error) {
        console.error("Error fetching transactions:", error);
    }

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
                            {transactions && transactions.length > 0 ? transactions.map((txn) => (
                                <TableRow key={txn.id}>
                                    <TableCell className="font-mono">{`TXN-${txn.id}`}</TableCell>
                                    <TableCell>{format(new Date(txn.created_at), 'PP')}</TableCell>
                                    <TableCell>{txn.description}</TableCell>
                                    <TableCell>
                                        <Badge variant={txn.type === 'Credit' ? 'secondary' : 'outline'} className={txn.type === 'Credit' ? 'text-green-600' : 'text-red-600'}>
                                            {txn.type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className={`text-right font-medium ${txn.type === 'Credit' ? 'text-green-600' : 'text-red-600'}`}>
                                        {txn.type === 'Credit' ? '' : '-'}
                                        {Number(txn.amount).toLocaleString()}
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">No transactions found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
