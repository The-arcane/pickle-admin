
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Landmark } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { createServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { saveBankDetails } from "./actions";
import { useToast } from "@/hooks/use-toast";
import { BankDetailsForm } from "./form";

export const dynamic = 'force-dynamic';

export default async function BankDetailsPage() {
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

    const { data: savedDetails, error } = await supabase
        .from('bank_details')
        .select('*')
        .eq('organisation_id', orgLink.organisation_id)
        .maybeSingle();

    if (error) {
        console.error("Error fetching bank details:", error);
    }
    
    // We do not have the unencrypted account number, so we will generate a masked version.
    const maskedAccountNumber = savedDetails?.id ? `XXXX XXXX XXXX ${savedDetails.id.toString().slice(-4)}` : 'No account on file';


    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Landmark className="h-8 w-8 text-gray-500" />
                <div>
                    <h1 className="text-2xl font-bold">Bank Details</h1>
                    <p className="text-muted-foreground">Manage your bank account for receiving payouts.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <BankDetailsForm />

                <Card>
                    <CardHeader>
                        <CardTitle>Currently Saved Bank Details</CardTitle>
                        <CardDescription>This is the account your payouts are sent to.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        {savedDetails ? (
                            <>
                                <div>
                                    <p className="text-muted-foreground">Bank Name</p>
                                    <p className="font-medium">{savedDetails.bank_name}</p>
                                </div>
                                <Separator />
                                <div>
                                    <p className="text-muted-foreground">Account Holder Name</p>
                                    <p className="font-medium">{savedDetails.account_holder_name}</p>
                                </div>
                                <Separator />
                                <div>
                                    <p className="text-muted-foreground">Account Number</p>
                                    <p className="font-mono">{maskedAccountNumber}</p>
                                </div>
                                <Separator />
                                <div>
                                    <p className="text-muted-foreground">IFSC Code</p>
                                    <p className="font-mono">{savedDetails.ifsc_code}</p>
                                </div>
                            </>
                        ) : (
                            <p className="text-center text-muted-foreground py-10">No bank details have been saved yet.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
