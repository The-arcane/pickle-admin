
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { MessageSquare, PlusCircle, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

// Mock Data for Faculty/Coaches
let mockFaculty = [
    { id: 'faculty_001', name: 'Coach Amit Sharma', role: 'Head Coach', expertise: 'Advanced Pickleball', contact: 'amit@example.com', availability: 'Mon-Fri, 9am-5pm' },
    { id: 'faculty_002', name: 'Priya Nair', role: 'PE Teacher', expertise: 'Beginner Training', contact: 'priya@example.com', availability: 'Tue/Thu, 10am-3pm' }
];

export default function CommunicationPage() {
    const [faculty, setFaculty] = useState(mockFaculty);
    const { toast } = useToast();

    const handleRemove = (facultyId: string) => {
        // In a real app, this would be an API call. Here, we filter the mock data.
        mockFaculty = mockFaculty.filter(f => f.id !== facultyId);
        setFaculty(mockFaculty);
        toast({ title: "Faculty Removed", description: "The faculty member has been removed from the directory." });
    }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-8 w-8 text-purple-500" />
          <div>
            <h1 className="text-3xl font-bold">Communication</h1>
            <p className="text-muted-foreground">Manage faculty directory and oversee communications.</p>
          </div>
        </div>
        <Button asChild>
          <Link href="/education/communication/add">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Faculty
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Faculty & Coach Directory</CardTitle>
          <CardDescription>A list of all staff members available for communication.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="hidden md:table-cell">Expertise</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {faculty.length > 0 ? (
                faculty.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell>{member.role}</TableCell>
                    <TableCell className="hidden md:table-cell">{member.expertise}</TableCell>
                    <TableCell>{member.contact}</TableCell>
                    <TableCell className="text-right">
                       <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                    <Link href={`/education/communication/${member.id}`}>Edit Profile</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>View Messages (mock)</DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => handleRemove(member.id)} className="text-destructive focus:text-destructive">
                                    Remove
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No faculty members found.
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
