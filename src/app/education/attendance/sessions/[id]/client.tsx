
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { saveSession } from '../actions';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useFormStatus } from 'react-dom';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';

type Session = {
    id: number;
    name: string;
    date: string;
    start_time: string;
    end_time: string;
    location: string;
    coach_id: number | null;
};

type Coach = {
    id: number;
    name: string | null;
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? 'Saving...' : 'Save Session'}
        </Button>
    )
}

export function EditSessionClientPage({
    session,
    coaches
}: {
    session: Session | null;
    coaches: Coach[];
}) {
    const { toast } = useToast();
    const router = useRouter();
    const isAdding = !session;

    const [date, setDate] = useState<Date | undefined>(
        session?.date ? parseISO(session.date) : undefined
    );
    
    // Format time from ISO string to HH:mm for input fields
    const formatTimeForInput = (isoString: string | undefined | null) => {
        if (!isoString) return '';
        try {
            return format(parseISO(isoString), 'HH:mm');
        } catch (e) {
            return '';
        }
    };
    
    async function handleFormAction(formData: FormData) {
        if (date) {
            formData.set('date', format(date, 'yyyy-MM-dd'));
        }

        const result = await saveSession(formData);
        if (result.error) {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        } else {
            toast({ title: 'Success', description: 'Session saved successfully.' });
        }
    }

    return (
        <form action={handleFormAction} className="space-y-6">
            {session && <input type="hidden" name="id" value={session.id} />}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-3">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/education/attendance/sessions"><ChevronLeft className="h-4 w-4" /></Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">{isAdding ? 'Create Session' : 'Edit Session'}</h1>
                        <p className="text-muted-foreground">{isAdding ? 'Schedule a new class or practice.' : 'Update the session details.'}</p>
                    </div>
                </div>
                <div className="w-full sm:w-auto">
                    <SubmitButton />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Session Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <Label htmlFor="name">Session Name</Label>
                           <Input id="name" name="name" defaultValue={session?.name ?? ''} placeholder="e.g., Morning Pickleball Drills" required />
                       </div>
                       <div className="space-y-2">
                           <Label htmlFor="location">Location</Label>
                           <Input id="location" name="location" defaultValue={session?.location ?? ''} placeholder="e.g., Main Court" required />
                       </div>
                   </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                           <Label htmlFor="date">Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !date && "text-muted-foreground"
                                    )}
                                    >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                                </PopoverContent>
                            </Popover>
                       </div>
                       <div className="space-y-2">
                           <Label htmlFor="start_time">Start Time</Label>
                           <Input id="start_time" name="start_time" type="time" defaultValue={formatTimeForInput(session?.start_time)} required />
                       </div>
                        <div className="space-y-2">
                           <Label htmlFor="end_time">End Time</Label>
                           <Input id="end_time" name="end_time" type="time" defaultValue={formatTimeForInput(session?.end_time)} required />
                       </div>
                   </div>
                   <div className="space-y-2">
                        <Label htmlFor="coach_id">Coach / Faculty</Label>
                        <Select name="coach_id" defaultValue={session?.coach_id?.toString()}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a coach" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">None</SelectItem>
                                {coaches.map(coach => (
                                    <SelectItem key={coach.id} value={coach.id.toString()}>{coach.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                   </div>
                </CardContent>
            </Card>
            <div className="flex justify-end">
                <SubmitButton />
            </div>
        </form>
    )
}
