
'use client';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createTicket } from './actions';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useRef } from 'react';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Submitting...' : 'Submit Ticket'}
        </Button>
    );
}

export function RaiseTicketForm({ organisationId }: { organisationId: number }) {
    const { toast } = useToast();
    const formRef = useRef<HTMLFormElement>(null);

    const formAction = async (_prevState: any, formData: FormData) => {
        const result = await createTicket(formData);
        if (result.error) {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        } else {
            toast({ title: 'Success', description: result.message });
            formRef.current?.reset();
        }
        return result;
    }
    
    const [state, dispatch] = useActionState(formAction, { error: null, success: false });

    return (
        <Card>
            <CardHeader>
                <CardTitle>New Support Ticket</CardTitle>
                <CardDescription>Describe your issue below and we'll get back to you as soon as possible.</CardDescription>
            </CardHeader>
            <CardContent>
                <form ref={formRef} action={dispatch} className="space-y-4">
                    <input type="hidden" name="organisation_id" value={organisationId} />
                    <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input id="subject" name="subject" placeholder="e.g., Issue with a booking" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="priority">Priority</Label>
                        <Select name="priority" required>
                            <SelectTrigger id="priority">
                                <SelectValue placeholder="Select a priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Low">Low</SelectItem>
                                <SelectItem value="Medium">Medium</SelectItem>
                                <SelectItem value="High">High</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" name="description" placeholder="Please provide as much detail as possible..." rows={6} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="attachment">Attachment</Label>
                        <Input id="attachment" type="file" />
                        <p className="text-xs text-muted-foreground">Optional: Attach a screenshot or relevant file.</p>
                    </div>
                    <SubmitButton />
                </form>
            </CardContent>
        </Card>
    );
}
