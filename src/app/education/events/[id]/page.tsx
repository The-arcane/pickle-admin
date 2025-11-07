
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
import { ChevronLeft, Calendar as CalendarIcon, Trash2, PlusCircle, AlertTriangle, Send } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// --- Mock Data ---
const mockTeams = [
  { id: 'team_001', name: 'Blue Smashers', players: ['Arjun Mehta', 'Priya Kapoor'] },
  { id: 'team_002', name: 'Green Aces', players: ['Rohan Sharma', 'Kavya Singh'] },
  { id: 'team_003', name: 'Red Racquets', players: ['Aisha Khan', 'Vikram Reddy'] },
];

let mockEvents = [
  {
    id: 'event_001',
    name: 'Annual Pickleball Championship',
    type: 'Tournament',
    scope: 'School-wide',
    startDate: new Date(new Date().setDate(new Date().getDate() + 10)),
    endDate: new Date(new Date().setDate(new Date().getDate() + 12)),
    venue: 'Main Sports Complex',
    instructions: 'Please arrive 30 minutes early for check-in.',
    participants: ['team_001', 'team_002', 'team_003'],
  },
];

let mockFixtures = [
    { eventId: 'event_001', teamA: 'Blue Smashers', teamB: 'Green Aces', scoreA: 0, scoreB: 0, status: 'Scheduled' }
];

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const eventId = params.id as string;
  const isAdding = eventId === 'add';

  const [event, setEvent] = useState<any>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState('Tournament');
  const [scope, setScope] = useState('School-wide');
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [venue, setVenue] = useState('');
  const [instructions, setInstructions] = useState('');
  const [participants, setParticipants] = useState<string[]>([]);
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [bracketGenerated, setBracketGenerated] = useState(false);

  useEffect(() => {
    if (!isAdding) {
      const existingEvent = mockEvents.find((e) => e.id === eventId);
      if (existingEvent) {
        setEvent(existingEvent);
        setName(existingEvent.name);
        setType(existingEvent.type);
        setScope(existingEvent.scope);
        setStartDate(existingEvent.startDate);
        setEndDate(existingEvent.endDate);
        setVenue(existingEvent.venue);
        setInstructions(existingEvent.instructions);
        setParticipants(existingEvent.participants);
        const eventFixtures = mockFixtures.filter(f => f.eventId === eventId);
        setFixtures(eventFixtures);
        if (eventFixtures.length > 0) setBracketGenerated(true);
      }
    }
  }, [isAdding, eventId]);

  const handleParticipantToggle = (teamId: string, checked: boolean) => {
    setParticipants((prev) =>
      checked ? [...prev, teamId] : prev.filter((id) => id !== teamId)
    );
  };

  const handleGenerateBracket = () => {
      setBracketGenerated(true);
      toast({ title: 'Bracket Generated', description: 'A mock tournament bracket has been created.' });
  }

  const handleScoreUpdate = (index: number, team: 'A' | 'B', value: string) => {
      const newFixtures = [...fixtures];
      const score = parseInt(value) || 0;
      if (team === 'A') newFixtures[index].scoreA = score;
      else newFixtures[index].scoreB = score;
      setFixtures(newFixtures);
  }

  const handleSimulateNotification = (message: string) => {
      toast({ title: 'Notification Sent (Simulated)', description: message });
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const eventData = {
      id: isAdding ? `event_${Date.now()}` : eventId,
      name, type, scope, startDate, endDate, venue, instructions, participants,
      status: 'Upcoming'
    };

    if (isAdding) {
      mockEvents.push(eventData);
    } else {
      const index = mockEvents.findIndex((e) => e.id === eventId);
      if (index !== -1) mockEvents[index] = { ...mockEvents[index], ...eventData };
    }

    toast({
      title: `Event ${isAdding ? 'Created' : 'Updated'}`,
      description: `Event "${name}" has been saved successfully.`,
    });
    router.push('/education/events');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-3">
          <Button variant="outline" size="icon" asChild>
            <Link href="/education/events"><ChevronLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{isAdding ? 'Create New Event' : 'Manage Event'}</h1>
            <p className="text-muted-foreground">{isAdding ? 'Fill in the details for the new event.' : event?.name}</p>
          </div>
        </div>
        <Button type="submit">Save Changes</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Event Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {/* Event Form Fields */}
              <div className="space-y-2">
                <Label htmlFor="name">Event Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Event Type</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tournament">Tournament</SelectItem>
                      <SelectItem value="Friendly">Friendly</SelectItem>
                      <SelectItem value="League">League</SelectItem>
                      <SelectItem value="Practice">Practice</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scope">Scope</Label>
                  <Select value={scope} onValueChange={setScope}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="School-wide">School-wide</SelectItem>
                      <SelectItem value="Inter-Class">Inter-Class</SelectItem>
                      <SelectItem value="Invitational">Invitational</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Popover>
                          <PopoverTrigger asChild><Button variant="outline" className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}</Button></PopoverTrigger>
                          <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={startDate} onSelect={setStartDate} /></PopoverContent>
                      </Popover>
                  </div>
                  <div className="space-y-2">
                      <Label>End Date</Label>
                      <Popover>
                          <PopoverTrigger asChild><Button variant="outline" className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{endDate ? format(endDate, 'PPP') : <span>Pick a date</span>}</Button></PopoverTrigger>
                          <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={endDate} onSelect={setEndDate} /></PopoverContent>
                      </Popover>
                  </div>
              </div>
              <div className="space-y-2">
                  <Label htmlFor="venue">Venue</Label>
                  <Input id="venue" value={venue} onChange={(e) => setVenue(e.target.value)} />
              </div>
              <div className="space-y-2">
                  <Label htmlFor="instructions">Special Instructions</Label>
                  <Textarea id="instructions" value={instructions} onChange={(e) => setInstructions(e.target.value)} />
              </div>
            </CardContent>
          </Card>
           {!isAdding && (
               <>
                 <Card>
                    <CardHeader><CardTitle>Scheduling & Fixtures</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        {fixtures.length > 0 && (
                             <Table>
                                <TableHeader><TableRow><TableHead>Match</TableHead><TableHead>Score</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {fixtures.map((fixture, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{fixture.teamA} vs {fixture.teamB}</TableCell>
                                            <TableCell className="flex items-center gap-2">
                                                <Input type="number" className="w-16" value={fixture.scoreA} onChange={(e) => handleScoreUpdate(index, 'A', e.target.value)} />
                                                <span>-</span>
                                                <Input type="number" className="w-16" value={fixture.scoreB} onChange={(e) => handleScoreUpdate(index, 'B', e.target.value)} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                        <Button type="button" onClick={handleGenerateBracket} disabled={bracketGenerated}>
                            {bracketGenerated ? 'Bracket Generated' : 'Generate Mock Bracket'}
                        </Button>
                         <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Scheduling Conflict!</AlertTitle>
                            <AlertDescription>
                                Blue Smashers have a practice session at the same time. (This is a mock alert)
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                 </Card>
                 <Card>
                     <CardHeader><CardTitle>Match Day Management</CardTitle></CardHeader>
                     <CardContent className="flex flex-wrap gap-2">
                        <Button type="button" variant="outline" onClick={() => handleSimulateNotification("Match Started: Blue Smashers vs Green Aces")}>Notify: Match Started</Button>
                        <Button type="button" variant="outline" onClick={() => handleSimulateNotification("Event Delayed: Est. 30 min delay")}>Notify: Delay</Button>
                        <Button type="button" variant="outline" onClick={() => handleSimulateNotification("Venue Change: All matches moved to Court 5")}>Notify: Venue Change</Button>
                     </CardContent>
                 </Card>
               </>
           )}
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader><CardTitle>Participants</CardTitle><CardDescription>Select teams for this event.</CardDescription></CardHeader>
            <CardContent className="space-y-2">
              {mockTeams.map((team) => (
                <div key={team.id} className="flex items-center gap-2">
                  <Checkbox id={`team-${team.id}`} checked={participants.includes(team.id)} onCheckedChange={(checked) => handleParticipantToggle(team.id, !!checked)} />
                  <Label htmlFor={`team-${team.id}`} className="font-normal">{team.name}</Label>
                </div>
              ))}
            </CardContent>
          </Card>
            {!isAdding && (
                 <Card>
                    <CardHeader><CardTitle>Pre-Event Communication</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        <Button type="button" className="w-full" onClick={() => handleSimulateNotification(`Initial alert sent for ${name}`)}><Send className="mr-2 h-4 w-4"/>Send Initial Alert</Button>
                        <Button type="button" variant="secondary" className="w-full" onClick={() => handleSimulateNotification(`Reminder sent for ${name}`)}><Send className="mr-2 h-4 w-4"/>Send Reminder</Button>
                    </CardContent>
                 </Card>
            )}
        </div>
      </div>
       <div className="flex justify-end">
         <Button type="submit">Save Changes</Button>
      </div>
    </form>
  );
}
