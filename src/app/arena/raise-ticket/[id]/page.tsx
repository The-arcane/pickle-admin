
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ChevronLeft, Send, Ticket } from "lucide-react";
import Link from "next/link";

const mockConversation = [
    { from: 'user', message: 'Hi, I noticed the payout for July seems to be incorrect. Can you please look into it?', time: '2 days ago' },
    { from: 'support', message: 'Hello! Thank you for reaching out. We are sorry for the inconvenience. Could you please provide the transaction ID for the payout?', time: '2 days ago' },
    { from: 'user', message: 'Yes, the transaction ID is TR-001.', time: '1 day ago' },
    { from: 'support', message: 'Thank you. We are investigating this and will get back to you with an update within 24 hours. The ticket status has been set to "In Progress".', time: '1 day ago' },
];

export default function TicketConversationPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
        <div className="flex items-center gap-3">
             <Button asChild variant="outline" size="icon" className="shrink-0">
                <Link href="/arena/raise-ticket"><ChevronLeft className="h-4 w-4" /></Link>
            </Button>
            <div className="flex items-center gap-3">
                <Ticket className="h-8 w-8 text-orange-500" />
                <div>
                    <h1 className="text-3xl font-bold">Ticket Details</h1>
                    <p className="text-muted-foreground font-mono">ID: {params.id}</p>
                </div>
            </div>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Conversation History</CardTitle>
                <CardDescription>Review the messages between you and the support team.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                 <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-4">
                    {mockConversation.map((msg, index) => (
                         <div key={index} className={`flex items-start gap-3 ${msg.from === 'user' ? 'justify-end' : ''}`}>
                             {msg.from === 'support' && (
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback>S</AvatarFallback>
                                </Avatar>
                             )}
                            <div className={`p-3 rounded-lg max-w-lg ${msg.from === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                <p className="text-sm">{msg.message}</p>
                                <p className={`text-xs mt-1 ${msg.from === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{msg.time}</p>
                            </div>
                             {msg.from === 'user' && (
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback>U</AvatarFallback>
                                </Avatar>
                             )}
                         </div>
                    ))}
                 </div>
                <div className="flex items-center gap-2 pt-4 border-t">
                    <Input placeholder="Type your reply..."/>
                    <Button><Send className="mr-2 h-4 w-4" /> Reply</Button>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
