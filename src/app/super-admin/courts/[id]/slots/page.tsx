
import { createServer } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default async function ManageSlotsPage({ params }: { params: { id: string } }) {
    const supabase = await createServer();
    const courtId = params.id;

    const { data: court, error: courtError } = await supabase
        .from('courts')
        .select('id, name')
        .eq('id', courtId)
        .single();
    
    if (courtError || !court) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Button asChild variant="outline" size="icon">
                    <Link href="/super-admin/courts"><ChevronLeft className="h-4 w-4" /></Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Manage Slots for {court.name}</h1>
                    <p className="text-muted-foreground">This is a placeholder page for managing court time slots.</p>
                </div>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Coming Soon</CardTitle>
                    <CardDescription>The interface to create, edit, and delete time slots will be implemented here.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Check back later for updates!</p>
                </CardContent>
            </Card>
        </div>
    );
}
