
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { LineChart as ChartIcon, Download } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts';

// Mock Data
const attendanceTrends = [
    { month: 'Jan', attendance: 85 }, { month: 'Feb', attendance: 88 },
    { month: 'Mar', attendance: 92 }, { month: 'Apr', attendance: 90 },
    { month: 'May', attendance: 95 }, { month: 'Jun', attendance: 91 },
];

const eventParticipation = [
    { event: 'Tournament A', participation: 78 },
    { event: 'Friendly Match', participation: 65 },
    { event: 'League Week 1', participation: 92 },
    { event: 'Practice Drills', participation: 85 },
];

const topPerformers = [
    { name: 'Arjun Mehta', attendance: '98%', score: 450, events: 5 },
    { name: 'Priya Kapoor', attendance: '95%', score: 420, events: 5 },
    { name: 'Rohan Sharma', attendance: '92%', score: 390, events: 4 },
];

export default function ReportsPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <ChartIcon className="h-8 w-8 text-green-500" />
                    <div>
                        <h1 className="text-2xl font-bold">Reports & Analytics Hub</h1>
                        <p className="text-muted-foreground">Key metrics and performance overview.</p>
                    </div>
                </div>
                 <div className="flex gap-2">
                    <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export as PDF</Button>
                    <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export as Excel</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Attendance Trends (Last 6 Months)</CardTitle>
                        <CardDescription>Monthly average attendance rate across all classes.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={attendanceTrends}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis unit="%" />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="attendance" stroke="#8884d8" name="Attendance Rate" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Event Participation Rates</CardTitle>
                        <CardDescription>Participation percentage for recent key events.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64">
                             <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={eventParticipation}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="event" />
                                    <YAxis unit="%" />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="participation" fill="#82ca9d" name="Participation Rate" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

             <Card>
                <CardHeader>
                    <CardTitle>Top Performers</CardTitle>
                    <CardDescription>Students with the highest combined attendance and scores.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student Name</TableHead>
                                <TableHead>Attendance</TableHead>
                                <TableHead>Mock Score</TableHead>
                                <TableHead>Events Attended</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {topPerformers.map((player) => (
                                <TableRow key={player.name}>
                                    <TableCell className="font-medium">{player.name}</TableCell>
                                    <TableCell>{player.attendance}</TableCell>
                                    <TableCell>{player.score}</TableCell>
                                    <TableCell>{player.events}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
