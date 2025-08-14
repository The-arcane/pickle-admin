
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, MessageSquare } from 'lucide-react';

// --- Mock Data ---
let mockFaculty = [
    { id: 'faculty_001', name: 'Coach Amit Sharma', role: 'Head Coach', expertise: 'Advanced Pickleball', contact: 'amit@example.com', availability: 'Mon-Fri, 9am-5pm' },
    { id: 'faculty_002', name: 'Priya Nair', role: 'PE Teacher', expertise: 'Beginner Training', contact: 'priya@example.com', availability: 'Tue/Thu, 10am-3pm' }
];

export default function EditFacultyPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const facultyId = params.id as string;
  const isAdding = facultyId === 'add';

  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [expertise, setExpertise] = useState('');
  const [contact, setContact] = useState('');
  const [availability, setAvailability] = useState('');

  useEffect(() => {
    if (!isAdding) {
      const existing = mockFaculty.find((f) => f.id === facultyId);
      if (existing) {
        setName(existing.name);
        setRole(existing.role);
        setExpertise(existing.expertise);
        setContact(existing.contact);
        setAvailability(existing.availability);
      }
    }
  }, [isAdding, facultyId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const facultyData = { id: isAdding ? `faculty_${Date.now()}` : facultyId, name, role, expertise, contact, availability };

    if (isAdding) {
      mockFaculty.push(facultyData);
    } else {
      const index = mockFaculty.findIndex((f) => f.id === facultyId);
      if (index !== -1) mockFaculty[index] = facultyData;
    }

    toast({
      title: `Faculty ${isAdding ? 'Created' : 'Updated'}`,
      description: `Profile for "${name}" has been saved successfully.`,
    });
    router.push('/education/communication');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-3">
          <Button variant="outline" size="icon" asChild>
            <Link href="/education/communication"><ChevronLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{isAdding ? 'Add New Faculty' : 'Edit Faculty Profile'}</h1>
            <p className="text-muted-foreground">{isAdding ? 'Create a new profile for a faculty or coach.' : `Editing profile for ${name}`}</p>
          </div>
        </div>
        <Button type="submit">Save Changes</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Enter the details for the faculty member.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input id="role" value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g., Head Coach" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="expertise">Expertise / Subject</Label>
            <Input id="expertise" value={expertise} onChange={(e) => setExpertise(e.target.value)} placeholder="e.g., Advanced Pickleball" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact">Primary Contact (Email or Phone)</Label>
            <Input id="contact" value={contact} onChange={(e) => setContact(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="availability">Availability Hours</Label>
            <Textarea id="availability" value={availability} onChange={(e) => setAvailability(e.target.value)} placeholder="e.g., Mon-Fri, 9am-5pm. Available for meetings on request." />
          </div>
        </CardContent>
      </Card>
      
      {!isAdding && (
          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5"/>Mock Communication History</CardTitle>
                <CardDescription>This is a static mock-up of a conversation view for demonstration.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-col gap-3 rounded-lg border p-4 max-h-96 overflow-y-auto">
                    {/* Mock Messages */}
                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">P</div>
                        <div>
                            <p className="font-semibold">Parent</p>
                            <div className="mt-1 rounded-lg bg-muted p-3 text-sm">Hi Coach, when is the next practice for the Blue Smashers?</div>
                        </div>
                    </div>
                     <div className="flex items-start gap-3 flex-row-reverse">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground font-bold">C</div>
                        <div className="text-right">
                            <p className="font-semibold">{name}</p>
                            <div className="mt-1 rounded-lg bg-primary text-primary-foreground p-3 text-sm text-left">Hi! It's scheduled for this Wednesday at 4 PM on Court 2.</div>
                        </div>
                    </div>
                     <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">P</div>
                        <div>
                            <p className="font-semibold">Parent</p>
                            <div className="mt-1 rounded-lg bg-muted p-3 text-sm">Great, thank you!</div>
                        </div>
                    </div>
                </div>
                 <div className="flex items-center gap-2">
                    <Input placeholder="Type a message... (disabled)" disabled />
                    <Button disabled>Send</Button>
                </div>
            </CardContent>
          </Card>
      )}

      <div className="flex justify-end">
        <Button type="submit">Save Changes</Button>
      </div>
    </form>
  );
}
