
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { saveAttendance } from '../actions';
import { CalendarCheck, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useFormStatus } from 'react-dom';

type Session = {
    id: number;
    name: string;
};

type Student = {
    id: number;
    name: string | null;
    profile_image_url: string | null;
};

type Status = {
    id: number;
    name: string;
};

type Record = {
    student_id: number;
    status_id: number;
    notes: string | null;
};

type AttendanceRecord = {
    student_id: number;
    status_id: number;
    notes: string;
};

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? 'Saving...' : 'Save Attendance'}
        </Button>
    )
}

function getInitials(name: string | undefined | null) {
  if (!name) return '';
  const names = name.split(' ').filter(Boolean);
  if (names.length > 1) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }
  return names[0]?.substring(0, 2).toUpperCase() ?? '';
};


export function MarkAttendanceClientPage({
    session,
    students,
    statuses,
    initialRecords
}: {
    session: Session;
    students: Student[];
    statuses: Status[];
    initialRecords: Record[];
}) {
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        // Find the ID for "Present" to use as a default
        const presentStatusId = statuses.find(s => s.name.toLowerCase() === 'present')?.id;

        const initialData = students.map(student => {
            const existingRecord = initialRecords.find(r => r.student_id === student.id);
            return {
                student_id: student.id,
                status_id: existingRecord?.status_id ?? presentStatusId ?? statuses[0]?.id,
                notes: existingRecord?.notes ?? '',
            };
        });
        setAttendance(initialData);
    }, [students, statuses, initialRecords]);

    const handleStatusChange = (studentId: number, statusId: number) => {
        setAttendance(prev => 
            prev.map(record => 
                record.student_id === studentId ? { ...record, status_id: statusId } : record
            )
        );
    };

    const handleNotesChange = (studentId: number, notes: string) => {
         setAttendance(prev => 
            prev.map(record => 
                record.student_id === studentId ? { ...record, notes } : record
            )
        );
    }
    
    async function handleFormAction(formData: FormData) {
        formData.append('records', JSON.stringify(attendance));

        const result = await saveAttendance(formData);
        if (result.error) {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        } else {
            toast({ title: 'Success', description: result.message });
            router.refresh(); // Refresh data on the page
        }
    }

    return (
        <form action={handleFormAction} className="space-y-6">
            <input type="hidden" name="session_id" value={session.id} />
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-3">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/education/attendance"><ChevronLeft className="h-4 w-4" /></Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">{session.name}</h1>
                        <p className="text-muted-foreground">Mark attendance for each student.</p>
                    </div>
                </div>
                <div className="w-full sm:w-auto">
                    <SubmitButton />
                </div>
            </div>

            <Card>
                <CardContent className="pt-6 space-y-4">
                    {students.map(student => {
                        const studentRecord = attendance.find(a => a.student_id === student.id);
                        return (
                             <div key={student.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3 border rounded-lg">
                                <div className="flex items-center gap-3 flex-1">
                                    <Avatar>
                                        <AvatarImage src={student.profile_image_url ?? undefined} alt={student.name ?? ''} />
                                        <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
                                    </Avatar>
                                    <p className="font-medium">{student.name}</p>
                                </div>
                                <RadioGroup
                                    value={studentRecord?.status_id?.toString()}
                                    onValueChange={(val) => handleStatusChange(student.id, parseInt(val))}
                                    className="flex items-center gap-4"
                                >
                                    {statuses.map(status => (
                                        <div key={status.id} className="flex items-center space-x-2">
                                            <RadioGroupItem value={status.id.toString()} id={`s${student.id}-r${status.id}`} />
                                            <Label htmlFor={`s${student.id}-r${status.id}`}>{status.name}</Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                                <Input
                                    placeholder="Add notes (e.g., late by 10 mins)"
                                    className="sm:w-64"
                                    value={studentRecord?.notes || ''}
                                    onChange={(e) => handleNotesChange(student.id, e.target.value)}
                                />
                             </div>
                        )
                    })}
                     {students.length === 0 && (
                        <div className="text-center text-muted-foreground p-8">
                            No students are enrolled in this session.
                        </div>
                    )}
                </CardContent>
            </Card>
            <div className="flex justify-end">
                <SubmitButton />
            </div>
        </form>
    )
}
