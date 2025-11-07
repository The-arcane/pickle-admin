
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Send } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Mock Data
const mockTemplates = {
    'Weather Delay': 'Due to weather, all matches are delayed by 1 hour. We will provide updates shortly.',
    'Match Cancellation': 'Unfortunately, today\'s matches have been cancelled due to unforeseen circumstances. We apologize for the inconvenience.',
    'Safety Alert': 'Please be aware of a safety concern near the main courts. Please proceed to the indoor gym until further notice.'
};

const mockRecipientGroups = [
    { id: 'all', name: 'All Parents' },
    { id: 'team_001', name: 'Parents of Blue Smashers' },
    { id: 'team_002', name: 'Parents of Green Aces' },
];

const mockAlertsLog = [
    { id: 1, type: 'Weather Delay', sentAt: new Date(new Date().setDate(new Date().getDate() -1)).toISOString() },
    { id: 2, type: 'Match Cancellation', sentAt: new Date(new Date().setDate(new Date().getDate() -3)).toISOString() },
];

export default function AlertsPage() {
    const { toast } = useToast();
    const [template, setTemplate] = useState('Weather Delay');
    const [message, setMessage] = useState(mockTemplates['Weather Delay']);
    const [recipient, setRecipient] = useState('all');

    const handleTemplateChange = (value: string) => {
        setTemplate(value);
        setMessage(mockTemplates[value as keyof typeof mockTemplates] || '');
    };

    const handleSendAlert = () => {
        toast({
            variant: 'destructive',
            title: 'Emergency Alert Sent (Simulated)',
            description: `"${message}" was sent to ${mockRecipientGroups.find(g => g.id === recipient)?.name}.`,
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <ShieldAlert className="h-8 w-8 text-red-500" />
                <div>
                    <h1 className="text-2xl font-bold">Emergency Alerts</h1>
                    <p className="text-muted-foreground">Send urgent communications to parents and faculty.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Compose Alert</CardTitle>
                        <CardDescription>Select a template or write a custom message, choose recipients, and send.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="template-select">Start with a template</Label>
                            <Select value={template} onValueChange={handleTemplateChange}>
                                <SelectTrigger id="template-select">
                                    <SelectValue placeholder="Select a template" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.keys(mockTemplates).map(key => (
                                        <SelectItem key={key} value={key}>{key}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="message">Message</Label>
                            <Textarea id="message" value={message} onChange={e => setMessage(e.target.value)} rows={5} />
                        </div>
                        
                        <div className="space-y-2">
                            <Label>Send to</Label>
                            <RadioGroup value={recipient} onValueChange={setRecipient}>
                                {mockRecipientGroups.map(group => (
                                    <div key={group.id} className="flex items-center space-x-2">
                                        <RadioGroupItem value={group.id} id={group.id} />
                                        <Label htmlFor={group.id} className="font-normal">{group.name}</Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>
                        
                        <Button onClick={handleSendAlert} className="w-full" variant="destructive">
                            <Send className="mr-2 h-4 w-4" /> Send Immediate Alert
                        </Button>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Alerts Log</CardTitle>
                        <CardDescription>A list of the most recently sent alerts.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                           {mockAlertsLog.map(log => (
                               <li key={log.id} className="p-3 border rounded-md">
                                   <p className="font-semibold text-red-600">{log.type}</p>
                                   <p className="text-xs text-muted-foreground">{new Date(log.sentAt).toLocaleString()}</p>
                               </li>
                           ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
