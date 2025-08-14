
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { BookCopy, PlusCircle, Upload, Video, FileText, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

// Mock Data
const mockResources = [
    { id: 'res_001', title: 'Basic Serve Techniques', type: 'Video', level: 'Beginner', url: '#', views: 124 },
    { id: 'res_002', title: 'Advanced Footwork Drills', type: 'PDF', level: 'Advanced', url: '#', views: 88 },
    { id: 'res_003', title: 'Doubles Strategy Guide', type: 'PDF', level: 'Intermediate', url: '#', views: 210 },
    { id: 'res_004', title: 'Warm-up Exercises', type: 'Video', level: 'Beginner', url: '#', views: 301 },
];

export default function ResourcesPage() {
    const [resources, setResources] = useState(mockResources);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [levelFilter, setLevelFilter] = useState('all');
    const { toast } = useToast();

    const filteredResources = useMemo(() => {
        if (levelFilter === 'all') return resources;
        return resources.filter(r => r.level.toLowerCase() === levelFilter);
    }, [resources, levelFilter]);

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const newResource = {
            id: `res_${Date.now()}`,
            title: formData.get('title') as string,
            type: formData.get('type') as string,
            level: formData.get('level') as string,
            url: '#',
            views: 0
        };

        setResources(prev => [newResource, ...prev]);
        toast({ title: 'Resource Added', description: `${newResource.title} has been added to the library.` });
        setIsFormOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <BookCopy className="h-8 w-8 text-orange-500" />
                    <div>
                        <h1 className="text-3xl font-bold">Training Resources</h1>
                        <p className="text-muted-foreground">Manage and share training materials.</p>
                    </div>
                </div>
                <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Resource
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Resource</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleFormSubmit} className="space-y-4">
                             <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input id="title" name="title" required />
                            </div>
                             <div className="grid grid-cols-2 gap-4">
                               <div className="space-y-2">
                                    <Label htmlFor="type">Type</Label>
                                    <Select name="type" defaultValue="Video">
                                        <SelectTrigger><SelectValue/></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Video">Video</SelectItem>
                                            <SelectItem value="PDF">PDF</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="level">Level</Label>
                                    <Select name="level" defaultValue="Beginner">
                                        <SelectTrigger><SelectValue/></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Beginner">Beginner</SelectItem>
                                            <SelectItem value="Intermediate">Intermediate</SelectItem>
                                            <SelectItem value="Advanced">Advanced</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="file">File Upload (Mock)</Label>
                                <Input id="file" type="file" />
                            </div>
                            <Button type="submit" className="w-full">Upload Resource</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                         <div>
                            <CardTitle>Resource Library</CardTitle>
                            <CardDescription>All available training materials.</CardDescription>
                         </div>
                         <Select value={levelFilter} onValueChange={setLevelFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by level..."/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Levels</SelectItem>
                                <SelectItem value="beginner">Beginner</SelectItem>
                                <SelectItem value="intermediate">Intermediate</SelectItem>
                                <SelectItem value="advanced">Advanced</SelectItem>
                            </SelectContent>
                         </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Level</TableHead>
                                <TableHead className="hidden sm:table-cell">Views</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredResources.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.title}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {item.type === 'Video' ? <Video className="h-4 w-4 text-red-500" /> : <FileText className="h-4 w-4 text-blue-500" />}
                                            <span>{item.type}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{item.level}</Badge>
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell">{item.views}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" asChild>
                                            <a href={item.url} target="_blank" rel="noopener noreferrer">
                                                <Eye className="mr-2 h-4 w-4" /> View
                                            </a>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
