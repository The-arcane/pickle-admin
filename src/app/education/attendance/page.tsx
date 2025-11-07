
'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { CalendarCheck, ArrowRight, PlusCircle, Edit } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

// Mock Data
const mockSessions = [
    { id: 1, name: 'Morning Pickleball Drills', date: new Date(), location: 'Main Court', roster: ['student_001', 'student_002'] },
    { id: 2, name: 'Afternoon Practice Match', date: new Date(new Date().setDate(new Date().getDate() + 1)), location: 'Court 2', roster: ['student_003', 'student_004'] },
];

export default function AttendanceSessionsPage() {
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
      // In a real app, you'd fetch this. Here we just set the mock data.
      setSessions(mockSessions);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
            <CalendarCheck className="h-8 w-8 text-primary" />
            <div>
            <h1 className="text-2xl font-bold">Attendance</h1>
            <p className="text-muted-foreground">Select a session to mark attendance.</p>
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
          <CardTitle>Today's Sessions</CardTitle>
          <CardDescription>Select a session below to start marking attendance.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Session</TableHead>
                <TableHead className="hidden md:table-cell">Time</TableHead>
                <TableHead className="hidden sm:table-cell">Location</TableHead>
                <TableHead>Enrolled</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.length > 0 ? (
                sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="font-medium">{session.name}</TableCell>
                    <TableCell className="hidden md:table-cell">{format(new Date(session.date), 'p')}</TableCell>
                    <TableCell className="hidden sm:table-cell">{session.location}</TableCell>
                    <TableCell>{session.roster.length} Students</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/education/attendance/sessions/${session.id}`}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </Link>
                      </Button>
                      <Button asChild size="sm">
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
                    No sessions scheduled.
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
