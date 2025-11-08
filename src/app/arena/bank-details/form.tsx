
'use client';

import { useToast } from "@/hooks/use-toast";
import { saveBankDetails } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormStatus } from "react-dom";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Saving...' : 'Save Details'}
        </Button>
    )
}

export function BankDetailsForm() {
    const { toast } = useToast();

    const handleFormAction = async (formData: FormData) => {
        const result = await saveBankDetails(formData);
        if (result.error) {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        } else {
            toast({ title: 'Success', description: result.message });
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Update Bank Account</CardTitle>
                <CardDescription>Enter the details of the bank account where you want to receive funds.</CardDescription>
            </CardHeader>
            <CardContent>
                <form action={handleFormAction} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="bankName">Bank Name</Label>
                        <Input id="bankName" name="bankName" placeholder="e.g., HDFC Bank" required/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="accountHolder">Account Holder Name</Label>
                        <Input id="accountHolder" name="accountHolder" placeholder="e.g., Arena Sports Complex" required/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="accountNumber">Account Number</Label>
                        <Input id="accountNumber" name="accountNumber" placeholder="Enter your bank account number" required/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="ifsc">IFSC Code</Label>
                        <Input id="ifsc" name="ifsc" placeholder="Enter the bank's IFSC code" required/>
                    </div>
                    <SubmitButton />
                </form>
            </CardContent>
        </Card>
    )
}
