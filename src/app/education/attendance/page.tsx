
import { createServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { CalendarCheck, Clock, MapPin, User, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default async function AttendanceSessionsPage() {
  const supabase = await createServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/login?type=education');
  }

  // For now, we will fetch all sessions. In a real app, this would be scoped to the user's school.
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
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching attendance sessions:', error);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <CalendarCheck className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Attendance</h1>
          <p className="text-muted-foreground">Select a session to mark attendance.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Sessions</CardTitle>
          <CardDescription>A list of all scheduled classes and practices.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Session</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="hidden sm:table-cell">Time</TableHead>
                <TableHead className="hidden md:table-cell">Coach</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions && sessions.length > 0 ? (
                sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell>
                        <p className="font-medium">{session.name}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                            <MapPin className="h-3 w-3" />
                            {session.location}
                        </p>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{format(new Date(session.date), 'PPP')}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                        {format(new Date(session.start_time), 'p')} - {format(new Date(session.end_time), 'p')}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{session.coach?.name ?? 'N/A'}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="outline">
                        <Link href={`/education/attendance/${session.id}`}>
                          Mark Attendance <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No sessions found.
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
