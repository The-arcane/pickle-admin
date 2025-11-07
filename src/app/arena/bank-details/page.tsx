
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Landmark } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function BankDetailsPage() {
  const savedDetails = {
    bankName: "HDFC Bank",
    accountHolder: "Arena Sports Complex",
    accountNumber: "XXXX XXXX XXXX 1234",
    ifsc: "HDFC0001234",
  };

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
            <Card>
                <CardHeader>
                    <CardTitle>Update Bank Account</CardTitle>
                    <CardDescription>Enter the details of the bank account where you want to receive funds.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="bankName">Bank Name</Label>
                        <Input id="bankName" placeholder="e.g., HDFC Bank" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="accountHolder">Account Holder Name</Label>
                        <Input id="accountHolder" placeholder="e.g., Arena Sports Complex" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="accountNumber">Account Number</Label>
                        <Input id="accountNumber" placeholder="Enter your bank account number" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="ifsc">IFSC Code</Label>
                        <Input id="ifsc" placeholder="Enter the bank's IFSC code" />
                    </div>
                    <Button className="w-full">Save Details</Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Currently Saved Bank Details</CardTitle>
                    <CardDescription>This is the account your payouts are sent to.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div>
                        <p className="text-muted-foreground">Bank Name</p>
                        <p className="font-medium">{savedDetails.bankName}</p>
                    </div>
                    <Separator />
                     <div>
                        <p className="text-muted-foreground">Account Holder Name</p>
                        <p className="font-medium">{savedDetails.accountHolder}</p>
                    </div>
                    <Separator />
                     <div>
                        <p className="text-muted-foreground">Account Number</p>
                        <p className="font-mono">{savedDetails.accountNumber}</p>
                    </div>
                     <Separator />
                      <div>
                        <p className="text-muted-foreground">IFSC Code</p>
                        <p className="font-mono">{savedDetails.ifsc}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
