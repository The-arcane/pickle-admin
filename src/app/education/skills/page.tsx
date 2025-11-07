
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trophy, Upload, BarChart2 } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

// Mock Data
const mockStudents = [
    { id: 'student_001', name: 'Arjun Mehta', serveAccuracy: 85, rallyLength: 12, footwork: 'Good', agility: 'Excellent', lastAssessment: { serveAccuracy: 75, rallyLength: 10 } },
    { id: 'student_002', name: 'Priya Kapoor', serveAccuracy: 78, rallyLength: 10, footwork: 'Average', agility: 'Good', lastAssessment: { serveAccuracy: 80, rallyLength: 8 } },
    { id: 'student_003', name: 'Rohan Sharma', serveAccuracy: 92, rallyLength: 15, footwork: 'Excellent', agility: 'Excellent', lastAssessment: { serveAccuracy: 88, rallyLength: 14 } },
];

const mockAchievements = [
    { student: 'Rohan Sharma', badge: 'Fastest Serve' },
    { student: 'Arjun Mehta', badge: 'Top Spinner' },
    { student: 'Priya Kapoor', badge: 'Rally Champion' },
];

export default function SkillsPage() {
    const [students, setStudents] = useState(mockStudents);
    const [selectedStudent, setSelectedStudent] = useState(students[0]);

    const handleScoreChange = (studentId: string, skill: string, value: number) => {
        setStudents(prev => 
            prev.map(s => s.id === studentId ? { ...s, [skill]: value } : s)
        );
    }
    
    const progressData = selectedStudent ? [
        { name: 'Serve Accuracy', 'Last': selectedStudent.lastAssessment.serveAccuracy, 'Current': selectedStudent.serveAccuracy },
        { name: 'Rally Length', 'Last': selectedStudent.lastAssessment.rallyLength, 'Current': selectedStudent.rallyLength },
    ] : [];

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Trophy className="h-8 w-8 text-yellow-500" />
                <div>
                    <h1 className="text-2xl font-bold">Skill Assessment</h1>
                    <p className="text-muted-foreground">Track player progress and manage assessments.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Player Skill Metrics</CardTitle>
                            <CardDescription>View and edit the latest skill assessments for each player.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Student</TableHead>
                                        <TableHead>Serve Accuracy (%)</TableHead>
                                        <TableHead>Avg. Rally</TableHead>
                                        <TableHead>Footwork</TableHead>
                                        <TableHead>Agility</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {students.map(student => (
                                        <TableRow key={student.id} onClick={() => setSelectedStudent(student)} className="cursor-pointer hover:bg-muted">
                                            <TableCell className="font-medium">{student.name}</TableCell>
                                            <TableCell>
                                                <Input type="number" value={student.serveAccuracy} onChange={(e) => handleScoreChange(student.id, 'serveAccuracy', parseInt(e.target.value))} className="w-20 h-8" />
                                            </TableCell>
                                            <TableCell>
                                                <Input type="number" value={student.rallyLength} onChange={(e) => handleScoreChange(student.id, 'rallyLength', parseInt(e.target.value))} className="w-20 h-8" />
                                            </TableCell>
                                            <TableCell>{student.footwork}</TableCell>
                                            <TableCell>{student.agility}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Achievements & Badges</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-2">
                            {mockAchievements.map((ach, i) => (
                                <Badge key={i} variant="secondary" className="text-base py-1 px-3">
                                    <Trophy className="mr-2 h-4 w-4 text-yellow-500"/>
                                    {ach.badge} - {ach.student}
                                </Badge>
                            ))}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Upload Assessment</CardTitle>
                        </CardHeader>
                         <CardContent>
                            <Button variant="outline" className="w-full"><Upload className="mr-2 h-4 w-4"/> Upload Report (PDF)</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart2 />
                        Progress: {selectedStudent?.name}
                    </CardTitle>
                    <CardDescription>Comparison between the last and current skill assessment.</CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={progressData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="Last" fill="#8884d8" name="Last Assessment" />
                                <Bar dataKey="Current" fill="#82ca9d" name="Current Assessment" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
