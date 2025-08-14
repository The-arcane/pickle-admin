
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon, Upload, PlayCircle, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

// Mock Data
const mockMedia = [
    { id: 'media_001', type: 'image', url: 'https://placehold.co/600x400.png?text=Match+Highlight', event: 'Championship Final', date: '2024-10-26', tags: ['Arjun Mehta'] },
    { id: 'media_002', type: 'video', url: 'https://placehold.co/600x400.png?text=Training+Video', event: 'Practice Session', date: '2024-10-24', tags: ['Team Practice'] },
    { id: 'media_003', type: 'image', url: 'https://placehold.co/600x400.png?text=Team+Photo', event: 'Championship Final', date: '2024-10-26', tags: ['Blue Smashers'] },
];

const mockEvents = [
    { id: 'event_001', name: 'Championship Final' },
    { id: 'event_002', name: 'Practice Session' },
];

const mockPlayers = [
    { id: 'player_001', name: 'Arjun Mehta' },
    { id: 'player_002', name: 'Priya Kapoor' },
];


export default function MediaPage() {
    const { toast } = useToast();
    const [filter, setFilter] = useState('all');

    const handleUpload = () => {
        toast({ title: 'Upload Successful', description: 'Your media has been uploaded (simulated).' });
    };

    const filteredMedia = mockMedia.filter(item => filter === 'all' || item.event === filter);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <ImageIcon className="h-8 w-8 text-cyan-500" />
                <div>
                    <h1 className="text-3xl font-bold">Content & Media Management</h1>
                    <p className="text-muted-foreground">Manage photos, videos, and highlights.</p>
                </div>
            </div>

             <Card>
                <CardHeader>
                    <CardTitle>Featured Content</CardTitle>
                </CardHeader>
                <CardContent>
                    <Carousel className="w-full max-w-lg mx-auto">
                        <CarouselContent>
                            {mockMedia.map((item, index) => (
                                <CarouselItem key={index}>
                                    <div className="p-1">
                                        <Card>
                                            <CardContent className="flex aspect-video items-center justify-center p-0 rounded-lg overflow-hidden">
                                                 <Image src={item.url} alt={item.event} width={600} height={400} className="object-cover" data-ai-hint="sports game" />
                                            </CardContent>
                                        </Card>
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious />
                        <CarouselNext />
                    </Carousel>
                </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Media Gallery</CardTitle>
                            <div className="flex items-center justify-between">
                                <CardDescription>All uploaded photos and videos.</CardDescription>
                                <Select value={filter} onValueChange={setFilter}>
                                    <SelectTrigger className="w-[200px]">
                                        <SelectValue placeholder="Filter by event..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Events</SelectItem>
                                        {mockEvents.map(e => <SelectItem key={e.id} value={e.name}>{e.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {filteredMedia.map(item => (
                                <Card key={item.id} className="overflow-hidden group">
                                    <div className="relative aspect-video">
                                        <Image src={item.url} alt={item.event} layout="fill" className="object-cover" data-ai-hint="pickleball action" />
                                        {item.type === 'video' && <PlayCircle className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-12 w-12 text-white/80" />}
                                    </div>
                                    <div className="p-3">
                                        <p className="text-sm font-medium">{item.event}</p>
                                        <p className="text-xs text-muted-foreground">{item.date}</p>
                                    </div>
                                </Card>
                            ))}
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-6">
                    <Card>
                         <CardHeader>
                            <CardTitle>Upload Media</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="media-file">File</Label>
                                <Input id="media-file" type="file" />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="event-tag">Tag to Event</Label>
                                <Select><SelectTrigger><SelectValue placeholder="Select event..."/></SelectTrigger><SelectContent/></Select>
                            </div>
                            <Button onClick={handleUpload} className="w-full"><Upload className="mr-2 h-4 w-4"/> Upload</Button>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-2">
                            <Star className="text-yellow-400" />
                            <CardTitle>Player of the Week</CardTitle>
                        </CardHeader>
                         <CardContent className="text-center space-y-2">
                             <Image src="https://placehold.co/100x100.png" alt="Player of the week" width={100} height={100} className="mx-auto rounded-full border-4 border-yellow-400" data-ai-hint="portrait person" />
                             <p className="font-bold text-lg">Priya Kapoor</p>
                             <p className="text-sm text-muted-foreground">For scoring 5 aces in the championship final!</p>
                         </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
