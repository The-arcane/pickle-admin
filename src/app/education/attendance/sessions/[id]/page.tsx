
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';

// Mock Data
const mockStudents = [
  { id: 'student_001', name: 'Arjun Mehta', grade: 10 },
  { id: 'student_002', name: 'Priya Kapoor', grade: 10 },
  { id: 'student_003', name: 'Rohan Sharma', grade: 9 },
  { id: 'student_004', name: 'Kavya Singh', grade: 9 },
  { id: 'student_005', name: 'Vikram Reddy', grade: 10 },
];

let mockSessions: any[] = [
    { id: 1, name: 'Morning Pickleball Drills', date: new Date(), location: 'Main Court', roster: ['student_001', 'student_002'] },
];

export default function EditSessionPage() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    const sessionId = params.id as string;
    const isAdding = sessionId === 'add';

    const [session, setSession] = useState<any>(null);
    const [name, setName] = useState('');
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [time, setTime] = useState('09:00');
    const [location, setLocation] = useState('');
    const [roster, setRoster] = useState<string[]>([]);
    
    useEffect(() => {
        if (!isAdding) {
            const existingSession = mockSessions.find(s => s.id.toString() === sessionId);
            if (existingSession) {
                setSession(existingSession);
                setName(existingSession.name);
                setDate(existingSession.date);
                setTime(format(existingSession.date, 'HH:mm'));
                setLocation(existingSession.location);
                setRoster(existingSession.roster);
            }
        }
    }, [isAdding, sessionId]);

    const handleRosterToggle = (studentId: string, checked: boolean) => {
        setRoster(prev => 
            checked ? [...prev, studentId] : prev.filter(id => id !== studentId)
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const sessionData = {
            id: isAdding ? Date.now() : parseInt(sessionId),
            name,
            date: new Date(`${format(date || new Date(), 'yyyy-MM-dd')}T${time}`),
            location,
            roster
        };

        if (isAdding) {
            mockSessions.push(sessionData);
        } else {
            const index = mockSessions.findIndex(s => s.id === sessionData.id);
            if(index !== -1) {
                mockSessions[index] = sessionData;
            }
        }

        toast({
            title: `Session ${isAdding ? 'Created' : 'Updated'}`,
            description: `Session "${name}" has been saved.`,
        });
        router.push('/education/attendance');
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/education/attendance"><ChevronLeft className="h-4 w-4" /></Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">{isAdding ? 'Create Session' : 'Edit Session'}</h1>
                        <p className="text-muted-foreground">{isAdding ? 'Schedule a new class or practice.' : 'Update the session details.'}</p>
                    </div>
                </div>
                <Button type="submit">Save Session</Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Session Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Session Name</Label>
                                <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Morning Pickleball Drills" required />
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="date">Date</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
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
                                    <Label htmlFor="time">Time</Label>
                                    <Input id="time" type="time" value={time} onChange={e => setTime(e.target.value)} required />
                                </div>
                            </div>
                            <div className="space-y-2">
                               <Label htmlFor="location">Location</Label>
                               <Input id="location" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g., Main Court" required />
                           </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-1">
                     <Card>
                        <CardHeader>
                            <CardTitle>Class Roster</CardTitle>
                            <CardDescription>Select students for this session.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                           {mockStudents.map(student => (
                               <div key={student.id} className="flex items-center space-x-3">
                                   <Checkbox 
                                        id={`student-${student.id}`} 
                                        checked={roster.includes(student.id)} 
                                        onCheckedChange={(checked) => handleRosterToggle(student.id, !!checked)}
                                    />
                                   <Label htmlFor={`student-${student.id}`} className="font-normal">{student.name} (Grade {student.grade})</Label>
                               </div>
                           ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
             <div className="flex justify-end">
                <Button type="submit">Save Session</Button>
            </div>
        </form>
    );
}
