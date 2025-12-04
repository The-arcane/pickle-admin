

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LifeBuoy, Phone, MessageSquare } from "lucide-react";

export default function ArenaSupportPage() {
  return (
    <div className="space-y-6">
        <div className="flex items-center gap-3">
            <LifeBuoy className="h-8 w-8 text-blue-500" />
            <div>
                <h1 className="text-2xl font-bold">Contact Support</h1>
                <p className="text-muted-foreground">Get help via phone or live chat.</p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <Phone className="h-6 w-6 text-green-500" />
                        <CardTitle>Phone Support</CardTitle>
                    </div>
                    <CardDescription>Speak directly with a support agent.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-1">
                        <p className="font-semibold">General Inquiries</p>
                        <p className="text-xl sm:text-2xl font-mono text-primary">+1 (800) 555-0199</p>
                        <p className="text-sm text-muted-foreground">Available 9am - 5pm, Mon-Fri</p>
                    </div>
                     <div className="space-y-1">
                        <p className="font-semibold">Emergency Line</p>
                        <p className="text-xl sm:text-2xl font-mono text-destructive">+1 (800) 555-0100</p>
                        <p className="text-sm text-muted-foreground">Available 24/7 for urgent issues</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <MessageSquare className="h-6 w-6 text-blue-500" />
                        <CardTitle>Live Chat</CardTitle>
                    </div>
                    <CardDescription>Get instant help from our support team online.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-start space-y-4">
                   <p className="text-muted-foreground">Our live chat agents are available to help you with any questions or issues you may have.</p>
                   <Button>
                        Start Live Chat
                   </Button>
                    <p className="text-xs text-muted-foreground">Typical response time: Under 2 minutes</p>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
