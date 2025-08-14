
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, Calendar as CalendarIcon, Send, Eye, MessageSquare } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';

// --- Mock Data ---
const mockEvents = [
  { id: 'event_001', name: 'Annual Pickleball Championship', date: new Date(new Date().setDate(new Date().getDate() + 10)), venue: 'Main Sports Complex'},
  { id: 'event_003', name: 'Intra-School League - Week 2', date: new Date(), venue: 'All Courts' },
];

const mockTemplates = {
    'Initial Alert': 'Hi there! This is a reminder for the upcoming event: {event_name} on {date} at {time} at {venue}. See you there!',
    'Reminder': 'Just a friendly reminder! {event_name} is happening tomorrow at {time}. Venue: {venue}.',
    'Live Update': 'A quick update from {event_name}: {message}',
    'Post-Match': 'Great game! The final score for the match at {event_name} was {score}. Congratulations to the winners!',
};

let mockNotifications = [
    { id: 'notif_001', eventId: 'event_001', type: 'Initial Alert', channel: 'Email', scheduledTime: new Date(new Date().setDate(new Date().getDate() + 5)), message: '' }
];

export default function EditNotificationPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const notifId = params.id as string;
  const isAdding = notifId === 'add';

  const [eventId, setEventId] = useState('');
  const [type, setType] = useState('Initial Alert');
  const [channel, setChannel] = useState('Push');
  const [message, setMessage] = useState('');
  const [scheduledTime, setScheduledTime] = useState<Date | undefined>(new Date());
  
  const selectedEvent = mockEvents.find(e => e.id === eventId);
  const template = mockTemplates[type as keyof typeof mockTemplates] || '';
  const filledTemplate = template
    .replace('{event_name}', selectedEvent?.name || '[Event Name]')
    .replace('{date}', selectedEvent ? format(selectedEvent.date, 'PPP') : '[Date]')
    .replace('{time}', selectedEvent ? format(selectedEvent.date, 'p') : '[Time]')
    .replace('{venue}', selectedEvent?.venue || '[Venue]')
    .replace('{message}', '[Your message here]')
    .replace('{score}', '[Score]');
    
  useEffect(() => {
    if (!isAdding) {
      const existing = mockNotifications.find(n => n.id === notifId);
      if (existing) {
        setEventId(existing.eventId);
        setType(existing.type);
        setChannel(existing.channel);
        setScheduledTime(existing.scheduledTime);
        setMessage(existing.message);
      }
    }
  }, [isAdding, notifId]);
  
  useEffect(() => {
      setMessage(filledTemplate)
  }, [eventId, type, filledTemplate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: `Notification ${isAdding ? 'Created' : 'Updated'}`,
      description: `The notification has been saved successfully.`,
    });
    router.push('/education/notifications');
  };
  
  const handleSendNow = () => {
    toast({
      title: 'Notification Sent (Simulated)',
      description: `A ${type} has been sent via ${channel} for ${selectedEvent?.name}.`,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-3">
          <Button variant="outline" size="icon" asChild>
            <Link href="/education/notifications"><ChevronLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{isAdding ? 'Create Notification' : 'Edit Notification'}</h1>
            <p className="text-muted-foreground">{isAdding ? 'Build and schedule a new notification.' : 'Update the notification details.'}</p>
          </div>
        </div>
        <div className="flex gap-2">
            <Button variant="secondary" type="button" onClick={handleSendNow}><Send className="mr-2 h-4 w-4"/> Send Now</Button>
            <Button type="submit">Save Changes</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader><CardTitle>Notification Content</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="event">Event</Label>
                      <Select value={eventId} onValueChange={setEventId}>
                        <SelectTrigger><SelectValue placeholder="Select an event" /></SelectTrigger>
                        <SelectContent>{mockEvents.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Notification Type / Template</Label>
                      <Select value={type} onValueChange={setType}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{Object.keys(mockTemplates).map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="message">Message Body</Label>
                      <Textarea id="message" value={message} onChange={e => setMessage(e.target.value)} rows={6} />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Scheduling & Delivery</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Delivery Channel</Label>
                        <RadioGroup value={channel} onValueChange={setChannel} className="flex gap-4">
                            <div className="flex items-center space-x-2"><RadioGroupItem value="Push" id="c_push" /><Label htmlFor="c_push">Push Notification</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="Email" id="c_email" /><Label htmlFor="c_email">Email</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="SMS" id="c_sms" /><Label htmlFor="c_sms">SMS</Label></div>
                        </RadioGroup>
                    </div>
                    <div className="space-y-2">
                        <Label>Schedule Time (Optional)</Label>
                        <Popover>
                            <PopoverTrigger asChild><Button variant="outline" className={cn("w-full justify-start text-left font-normal", !scheduledTime && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{scheduledTime ? format(scheduledTime, 'PPP p') : <span>Pick a date and time</span>}</Button></PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={scheduledTime} onSelect={setScheduledTime} />
                                <div className="p-3 border-t border-border"><Input type="time" value={scheduledTime ? format(scheduledTime, 'HH:mm') : ''} onChange={e => {const time = e.target.value; const [h, m] = time.split(':').map(Number); const newDate = scheduledTime ? new Date(scheduledTime) : new Date(); newDate.setHours(h, m); setScheduledTime(newDate);}} /></div>
                            </PopoverContent>
                        </Popover>
                        <p className="text-xs text-muted-foreground">If not set, the notification will be a draft until sent manually.</p>
                    </div>
                </CardContent>
              </Card>
          </div>
          <div className="lg:col-span-1">
             <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Eye className="h-5 w-5" />Notification Preview</CardTitle></CardHeader>
                <CardContent>
                    <div className="p-4 rounded-lg bg-muted space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                                <MessageSquare />
                            </div>
                            <div>
                                <h4 className="font-semibold">{selectedEvent?.name || "Event Title"}</h4>
                                <p className="text-xs text-muted-foreground">via {channel}</p>
                            </div>
                        </div>
                        <Separator />
                        <p className="text-sm whitespace-pre-wrap">{message}</p>
                    </div>
                </CardContent>
            </Card>
          </div>
      </div>
      <div className="flex justify-end gap-2">
         <Button variant="secondary" type="button" onClick={handleSendNow}><Send className="mr-2 h-4 w-4"/> Send Now</Button>
         <Button type="submit">Save Changes</Button>
      </div>
    </form>
  );
}
