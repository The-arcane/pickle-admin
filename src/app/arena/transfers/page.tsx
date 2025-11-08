
import { createServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Banknote } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { format } from 'date-fns';

export default async function ArenaTransfersPage() {
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
    
    const { data: transfers, error } = await supabase
        .from('payouts')
        .select('*')
        .eq('organisation_id', orgLink.organisation_id)
        .order('requested_at', { ascending: false });

    if(error) {
        console.error("Error fetching transfers:", error);
    }
    
    // Calculate current balance
    const { data: balanceData, error: balanceError } = await supabase.rpc('get_organisation_balance', {
        p_organisation_id: orgLink.organisation_id
    });
     
    if(balanceError) {
        console.error("Error fetching balance:", balanceError);
    }
    const availableBalance = balanceData ?? 0;

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
                <p className="text-2xl font-bold">₹ {availableBalance.toLocaleString('en-IN')}</p>
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
                        {transfers && transfers.length > 0 ? transfers.map((transfer) => (
                            <TableRow key={transfer.id}>
                                <TableCell className="font-mono">{`TR-${transfer.id}`}</TableCell>
                                <TableCell>{format(new Date(transfer.requested_at), 'PP')}</TableCell>
                                <TableCell>{Number(transfer.amount).toLocaleString()}</TableCell>
                                <TableCell><StatusBadge status={transfer.status} /></TableCell>
                            </TableRow>
                        )) : (
                           <TableRow>
                               <TableCell colSpan={4} className="text-center h-24">No transfers found.</TableCell>
                           </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  );
}
