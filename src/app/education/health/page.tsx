
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { HeartPulse, AlertTriangle, Send } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

// Mock Data
const mockHealthRecords = [
    { id: 'student_001', student: 'Arjun Mehta', allergies: 'None', medicalConditions: 'None' },
    { id: 'student_002', student: 'Priya Kapoor', allergies: 'Pollen', medicalConditions: 'None' },
    { id: 'student_003', student: 'Rohan Sharma', allergies: 'Peanuts', medicalConditions: 'Asthma (Inhaler required)' },
    { id: 'student_004', student: 'Kavya Singh', allergies: 'None', medicalConditions: 'None' },
];

const mockInjuryLog = [
    { id: 1, student: 'Arjun Mehta', date: '2025-08-10', injury: 'Sprained Ankle', notes: 'Occurred during warm-up. Iced immediately.', status: 'Recovering' },
    { id: 2, student: 'Priya Kapoor', date: '2025-07-22', injury: 'Minor Scrape', notes: 'Fell during a match. Cleaned and bandaged.', status: 'Recovered' },
];

const mockReturnChecklist = [
    { id: 'step_1', label: 'Doctor\'s Clearance Received' },
    { id: 'step_2', label: 'Full Range of Motion without Pain' },
    { id: 'step_3', label: 'Completed a Pain-free Practice' },
];


export default function HealthAndSafetyPage() {
    const { toast } = useToast();

    const handleReportInjury = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const studentName = formData.get('student');
        toast({
            title: 'Injury Report Submitted (Simulated)',
            description: `A report has been filed and a notification sent to the parents of ${studentName}.`,
            variant: 'destructive',
        });
    };
    
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Recovered':
                return 'bg-green-500/20 text-green-700 border-green-500/20';
            case 'Recovering':
                 return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/20';
            default: return 'secondary';
        }
    }


    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <HeartPulse className="h-8 w-8 text-red-500" />
                <div>
                    <h1 className="text-2xl font-bold">Health &amp; Safety</h1>
                    <p className="text-muted-foreground">Monitor student health, log injuries, and manage safety protocols.</p>
                </div>
            </div>

            <Card className="border-red-500/30 bg-red-500/10">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                        <CardTitle>Active Alerts</CardTitle>
                    </div>
                    <CardDescription className="text-red-700/80">
                        Immediate health and safety concerns that require attention.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     <p><strong>Arjun Mehta:</strong> Ankle injury on Aug 10, 2025. Awaiting doctor's clearance for return-to-play.</p>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Report New Injury</CardTitle>
                        <CardDescription>Log a new injury and automatically notify parents.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleReportInjury} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="student">Student</Label>
                                <Select name="student">
                                    <SelectTrigger id="student"><SelectValue placeholder="Select a student" /></SelectTrigger>
                                    <SelectContent>
                                        {mockHealthRecords.map(s => <SelectItem key={s.id} value={s.student}>{s.student}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="injury">Injury Description</Label>
                                <Input id="injury" placeholder="e.g., Twisted right ankle" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="notes">Action Taken & Notes</Label>
                                <Textarea id="notes" placeholder="e.g., Applied ice pack, parent contacted." />
                            </div>
                            <Button type="submit" variant="destructive" className="w-full">
                                <Send className="mr-2 h-4 w-4" /> Report & Notify Parent
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Return-to-Play Checklist</CardTitle>
                        <CardDescription>For Arjun Mehta (Sprained Ankle)</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {mockReturnChecklist.map(item => (
                             <div key={item.id} className="flex items-center space-x-3 p-3 border rounded-md">
                                <Checkbox id={item.id} />
                                <Label htmlFor={item.id} className="font-normal flex-1">{item.label}</Label>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
            
             <Card>
                <CardHeader>
                    <CardTitle>Injury Log</CardTitle>
                    <CardDescription>A record of all past and current injuries.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student</TableHead>
                                <TableHead>Injury</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Notes</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockInjuryLog.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.student}</TableCell>
                                    <TableCell>{item.injury}</TableCell>
                                    <TableCell>{item.date}</TableCell>
                                    <TableCell>{item.notes}</TableCell>
                                    <TableCell><Badge variant="outline" className={getStatusColor(item.status)}>{item.status}</Badge></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Player Health Records</CardTitle>
                    <CardDescription>Important medical information for each student. For authorized personnel only.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student Name</TableHead>
                                <TableHead>Allergies</TableHead>
                                <TableHead>Medical Conditions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockHealthRecords.map((player) => (
                                <TableRow key={player.id}>
                                    <TableCell className="font-medium">{player.student}</TableCell>
                                    <TableCell className={player.allergies !== 'None' ? 'text-red-600 font-semibold' : ''}>{player.allergies}</TableCell>
                                    <TableCell className={player.medicalConditions !== 'None' ? 'text-red-600 font-semibold' : ''}>{player.medicalConditions}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

        </div>
    );
}
