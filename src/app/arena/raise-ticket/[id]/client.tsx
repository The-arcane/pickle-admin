
'use client';
import { useState, useRef, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { addTicketReply } from '../actions';

type Message = {
    id: number;
    message: string;
    time: string;
    from: 'user' | 'support';
    userInitials: string;
    isSuperAdmin: boolean;
};

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? 'Sending...' : <Send className="mr-2 h-4 w-4" />}
            {pending ? '' : 'Reply'}
        </Button>
    )
}

export function ConversationClient({ ticketId, initialMessages, currentUserId }: { ticketId: number, initialMessages: Message[], currentUserId: string }) {
    const { toast } = useToast();
    const formRef = useRef<HTMLFormElement>(null);

    async function formAction(_prevState: any, formData: FormData) {
        const result = await addTicketReply(formData);
        if (result.error) {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        } else {
            formRef.current?.reset();
        }
        return result;
    }
    const [state, dispatch] = useActionState(formAction, null);

    return (
        <Card>
            <CardContent className="pt-6 space-y-6">
                <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-4">
                {initialMessages.map((msg) => (
                    <div key={msg.id} className={`flex items-start gap-3 ${msg.from === 'user' ? 'justify-end' : ''}`}>
                        {msg.from === 'support' && (
                        <Avatar className="h-8 w-8">
                            <AvatarFallback className={msg.isSuperAdmin ? 'bg-red-500 text-white' : ''}>S</AvatarFallback>
                        </Avatar>
                        )}
                        <div className={`p-3 rounded-lg max-w-lg ${msg.from === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                        <p className="text-sm">{msg.message}</p>
                        <p className={`text-xs mt-1 ${msg.from === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{msg.time}</p>
                        </div>
                        {msg.from === 'user' && (
                        <Avatar className="h-8 w-8">
                            <AvatarFallback>{msg.userInitials}</AvatarFallback>
                        </Avatar>
                        )}
                    </div>
                ))}
                 {initialMessages.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No messages yet. The ticket description will appear here once submitted.</p>
                )}
                </div>
                <form ref={formRef} action={dispatch} className="flex items-center gap-2 pt-4 border-t">
                    <input type="hidden" name="ticket_id" value={ticketId} />
                    <Input name="message" placeholder="Type your reply..." required />
                    <SubmitButton />
                </form>
            </CardContent>
        </Card>
    );
}
