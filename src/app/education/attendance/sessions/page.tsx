
import { createServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { BookCopy, Edit, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default async function AttendanceSessionsListPage() {
  const supabase = await createServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/login?type=education');
  }

  const { data: userProfile } = await supabase.from('user').select('id, user_organisations(organisation_id)').eq('user_uuid', user.id).single();
  const organisationId = userProfile?.user_organisations[0]?.organisation_id;

  if (!organisationId) {
      return <p>You are not associated with any organization.</p>;
  }

  const { data: sessions, error } = await supabase
    .from('attendance_sessions')
    .select(`
        id,
        name,
        date,
        start_time,
        end_time,
        location,
        coach:coach_id(name)
    `)
    .eq('organisation_id', organisationId)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching attendance sessions:', error);
  }
  
  let displaySessions = sessions;
  // Add mock data if no sessions are found
  if (!displaySessions || displaySessions.length === 0) {
      const today = new Date();
      const startTime = new Date(today.setHours(9, 0, 0, 0)).toISOString();
      const endTime = new Date(today.setHours(11, 0, 0, 0)).toISOString();
      displaySessions = [
          { id: 1, name: 'Morning Pickleball Drills', date: today.toISOString(), start_time: startTime, end_time: endTime, location: 'Main Court', coach: { name: 'Coach John' } },
          { id: 2, name: 'Afternoon Practice Match', date: today.toISOString(), start_time: new Date(today.setHours(14, 0, 0, 0)).toISOString(), end_time: new Date(today.setHours(16, 0, 0, 0)).toISOString(), location: 'Court 2', coach: { name: 'Coach Sarah' } },
      ];
  }


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
            <BookCopy className="h-8 w-8 text-primary" />
            <div>
            <h1 className="text-3xl font-bold">Manage Sessions</h1>
            <p className="text-muted-foreground">Create, view, and edit class and practice sessions.</p>
            </div>
        </div>
        <Button asChild>
            <Link href="/education/attendance/sessions/add">
                <PlusCircle className="mr-2 h-4 w-4" /> Create Session
            </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Scheduled Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Session Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Coach</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displaySessions && displaySessions.length > 0 ? (
                displaySessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="font-medium">{session.name}</TableCell>
                    <TableCell>{format(new Date(session.date), 'PPP')}</TableCell>
                    <TableCell>
                        {format(new Date(session.start_time), 'p')} - {format(new Date(session.end_time), 'p')}
                    </TableCell>
                    <TableCell>{session.location}</TableCell>
                    <TableCell>{session.coach?.name ?? 'N/A'}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="outline" size="icon">
                        <Link href={`/education/attendance/sessions/${session.id}`}>
                          <Edit className="h-4 w-4" />
                           <span className="sr-only">Edit Session</span>
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No sessions have been created yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
