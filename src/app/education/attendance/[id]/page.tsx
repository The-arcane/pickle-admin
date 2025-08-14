
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, QrCode } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

// --- Mock Data ---
const mockStudents = [
  { id: 'student_001', name: 'Arjun Mehta', grade: 10, profile_image_url: null },
  { id: 'student_002', name: 'Priya Kapoor', grade: 10, profile_image_url: 'https://placehold.co/40x40/E2E8F0/4A5568.png' },
  { id: 'student_003', name: 'Rohan Sharma', grade: 9, profile_image_url: null },
  { id: 'student_004', name: 'Kavya Singh', grade: 9, profile_image_url: null },
];

const mockSessions = [
    { id: '1', name: 'Morning Pickleball Drills', date: new Date(), location: 'Main Court', roster: ['student_001', 'student_002', 'student_003'] },
    { id: '2', name: 'Afternoon Practice Match', date: new Date(), location: 'Court 2', roster: ['student_003', 'student_004'] },
];

let attendanceRecords: any[] = []; // In-memory store

const getInitials = (name: string | null) => {
  if (!name) return '';
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

export default function MarkAttendancePage() {
    const params = useParams();
    const router = useRouter();
    const sessionId = params.id as string;
    const { toast } = useToast();

    const [session, setSession] = useState<any>(null);
    const [roster, setRoster] = useState<any[]>([]);
    const [attendance, setAttendance] = useState<any>({});
    const [isLocked, setIsLocked] = useState(false);
    
    useEffect(() => {
        const currentSession = mockSessions.find(s => s.id === sessionId);
        if (currentSession) {
            setSession(currentSession);
            const sessionRoster = mockStudents.filter(s => currentSession.roster.includes(s.id));
            setRoster(sessionRoster);
            
            // Initialize attendance state
            const initialAttendance: any = {};
            sessionRoster.forEach(student => {
                initialAttendance[student.id] = { status: 'present', late: false, earlyLeave: false };
            });
            setAttendance(initialAttendance);
        }
    }, [sessionId]);

    const handleAttendanceChange = (studentId: string, field: string, value: any) => {
        setAttendance((prev: any) => ({
            ...prev,
            [studentId]: { ...prev[studentId], [field]: value }
        }));
    };

    const handleSubmit = () => {
        const recordsToSave = roster.map(student => ({
            sessionId,
            studentId: student.id,
            timestamp: new Date().toISOString(),
            status: attendance[student.id].status,
            late: attendance[student.id].late,
            earlyLeave: attendance[student.id].earlyLeave,
        }));
        
        // In-memory update
        attendanceRecords = [...attendanceRecords.filter(r => r.sessionId !== sessionId), ...recordsToSave];
        
        setIsLocked(true);
        toast({ title: 'Attendance Submitted', description: 'The records for this session have been saved and locked.' });

        // Simulate absentee notifications
        recordsToSave.forEach(record => {
            if (record.status === 'absent') {
                 toast({ title: 'Absence Notification', description: `A notification has been generated for ${roster.find(s=>s.id === record.studentId)?.name}.`, variant: 'destructive' });
            }
        });
    };
    
    if (!session) {
        return <div>Loading session...</div>;
    }

    const attendanceSummary = roster.map(student => {
        const record = attendance[student.id];
        return {
            name: student.name,
            status: record?.status,
            notes: [record?.late && 'Late', record?.earlyLeave && 'Left Early'].filter(Boolean).join(', ')
        };
    });
    
    const participationRate = (roster.filter(s => attendance[s.id]?.status === 'present').length / roster.length) * 100;
    
    const qrCodeData = `session_id:${sessionId}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrCodeData)}&size=200x200`;


    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/education/attendance"><ChevronLeft className="h-4 w-4" /></Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">{session.name}</h1>
                        <p className="text-muted-foreground">Mark attendance for each student below.</p>
                    </div>
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline"><QrCode className="mr-2 h-4 w-4"/> Generate Session QR Code</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Session QR Code</DialogTitle>
                        </DialogHeader>
                        <div className="flex flex-col items-center justify-center py-4">
                            <Image src={qrCodeUrl} alt="Session QR Code" width={200} height={200} data-ai-hint="qr code" />
                             <p className="mt-4 text-sm text-muted-foreground">Students can scan this to mark their presence.</p>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {isLocked && (
                <Alert>
                    <AlertTitle>Attendance Locked</AlertTitle>
                    <AlertDescription className="flex items-center justify-between">
                       <span>This session's attendance has been submitted.</span>
                       <Button variant="secondary" size="sm" onClick={() => {
                           setIsLocked(false);
                           console.log(`ATTENDANCE_LOG: Session ${sessionId} unlocked for editing at ${new Date().toISOString()}`);
                           toast({title: "Session Unlocked", description: "You can now edit the attendance records."})
                        }}>Unlock for Edit</Button>
                    </AlertDescription>
                </Alert>
            )}

            <Card>
                <CardContent className="pt-6 space-y-4">
                    {roster.map(student => (
                         <div key={student.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 border rounded-lg items-center">
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src={student.profile_image_url ?? undefined} alt={student.name ?? ''} />
                                    <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
                                </Avatar>
                                <p className="font-medium">{student.name}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox id={`present-${student.id}`} checked={attendance[student.id]?.status === 'present'} onCheckedChange={(checked) => handleAttendanceChange(student.id, 'status', checked ? 'present' : 'absent')} disabled={isLocked} />
                                    <Label htmlFor={`present-${student.id}`}>Present</Label>
                                </div>
                                 <div className="flex items-center space-x-2">
                                    <Checkbox id={`absent-${student.id}`} checked={attendance[student.id]?.status === 'absent'} onCheckedChange={(checked) => handleAttendanceChange(student.id, 'status', checked ? 'absent' : 'present')} disabled={isLocked} />
                                    <Label htmlFor={`absent-${student.id}`}>Absent</Label>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 justify-start md:justify-end">
                                <div className="flex items-center space-x-2">
                                    <Switch id={`late-${student.id}`} checked={attendance[student.id]?.late} onCheckedChange={(checked) => handleAttendanceChange(student.id, 'late', checked)} disabled={isLocked} />
                                    <Label htmlFor={`late-${student.id}`}>Late Arrival</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch id={`early-${student.id}`} checked={attendance[student.id]?.earlyLeave} onCheckedChange={(checked) => handleAttendanceChange(student.id, 'earlyLeave', checked)} disabled={isLocked} />
                                    <Label htmlFor={`early-${student.id}`}>Early Leave</Label>
                                </div>
                            </div>
                         </div>
                    ))}
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <Card>
                    <CardHeader>
                        <CardTitle>Session Summary</CardTitle>
                        <CardDescription>Review of attendance for this session.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Table>
                             <TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Status</TableHead><TableHead>Notes</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {attendanceSummary.map(item => (
                                    <TableRow key={item.name}>
                                        <TableCell>{item.name}</TableCell>
                                        <TableCell className="capitalize">{item.status}</TableCell>
                                        <TableCell>{item.notes || '—'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Analytics</CardTitle>
                        <CardDescription>Participation rate for this session.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="w-full h-48">
                             <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={[{ name: 'Participation', rate: participationRate }]}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis domain={[0, 100]} unit="%" />
                                    <Tooltip formatter={(value) => `${(value as number).toFixed(1)}%`} />
                                    <Bar dataKey="rate" fill="#8884d8" name="Participation Rate" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-end">
                <Button onClick={handleSubmit} disabled={isLocked}>Submit & Lock Attendance</Button>
            </div>
        </div>
    );

    