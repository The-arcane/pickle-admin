
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trophy, Archive, Edit } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Mock Data
const mockLeaderboard = [
    { id: 'team_001', team: 'Blue Smashers', played: 5, wins: 4, points: 12 },
    { id: 'team_002', team: 'Green Aces', played: 5, wins: 3, points: 9 },
    { id: 'team_003', team: 'Red Racquets', played: 5, wins: 2, points: 6 },
];

const mockArchivedSeasons = ['2024 School Year', '2023 Fall League'];

export default function SeasonPage() {
    const [leaderboard, setLeaderboard] = useState(mockLeaderboard);
    const [selectedTeam, setSelectedTeam] = useState('');
    const [points, setPoints] = useState('');
    const { toast } = useToast();

    const handleUpdatePoints = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTeam || !points) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please select a team and enter points.' });
            return;
        }

        setLeaderboard(prev => 
            prev.map(t => t.id === selectedTeam ? { ...t, points: t.points + parseInt(points, 10) } : t)
        );

        toast({ title: 'Success', description: 'Points updated successfully.' });
        setSelectedTeam('');
        setPoints('');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Trophy className="h-8 w-8 text-yellow-500" />
                    <div>
                        <h1 className="text-2xl font-bold">Season & Leaderboard</h1>
                        <p className="text-muted-foreground">Manage the active season and view team standings.</p>
                    </div>
                </div>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Active Season: 2025 School Year</CardTitle>
                    <CardDescription>Points table for the current season.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Team</TableHead>
                                <TableHead>Played</TableHead>
                                <TableHead>Wins</TableHead>
                                <TableHead>Points</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {leaderboard.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.team}</TableCell>
                                    <TableCell>{item.played}</TableCell>
                                    <TableCell>{item.wins}</TableCell>
                                    <TableCell>{item.points}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Update Points</CardTitle>
                        <CardDescription>Manually add or update points for a team.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleUpdatePoints} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="team-select">Team</Label>
                                <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                                    <SelectTrigger id="team-select">
                                        <SelectValue placeholder="Select a team" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {leaderboard.map(team => (
                                            <SelectItem key={team.id} value={team.id}>{team.team}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="points">Points to Add</Label>
                                <Input id="points" type="number" value={points} onChange={e => setPoints(e.target.value)} placeholder="e.g., 3 for a win" />
                            </div>
                            <Button type="submit" className="w-full">
                                <Edit className="mr-2 h-4 w-4" /> Update Points
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Archived Seasons</CardTitle>
                        <CardDescription>View leaderboards from previous seasons.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {mockArchivedSeasons.map(season => (
                                <li key={season} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                                    <span className="flex items-center gap-2 text-sm">
                                        <Archive className="h-4 w-4 text-muted-foreground" />
                                        {season}
                                    </span>
                                    <Button variant="ghost" size="sm">View</Button>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
