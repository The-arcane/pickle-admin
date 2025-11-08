
import { createServer } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { UnavailabilityClientPage } from './client';

export const dynamic = 'force-dynamic';

export default async function ManageSlotsPage({ params }: { params: { id: string } }) {
    const supabase = await createServer();
    const courtId = Number(params.id);

    const { data: court, error: courtError } = await supabase
        .from('courts')
        .select('id, name, availability_blocks(*)')
        .eq('id', courtId)
        .single();
    
    if (courtError || !court) {
        notFound();
    }
    
    // Sort availability blocks by date and then start time for consistent display
    const sortedAvailability = court.availability_blocks.sort((a, b) => {
        if (!a.date || !b.date) return 0;
        const dateComparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        if (dateComparison !== 0) return dateComparison;
        
        if (!a.start_time || !b.start_time) return 0;
        return a.start_time.localeCompare(b.start_time);
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Button asChild variant="outline" size="icon">
                    <Link href="/livingspace/courts"><ChevronLeft className="h-4 w-4" /></Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Manage Unavailability for {court.name}</h1>
                    <p className="text-muted-foreground">Block out specific dates and times for this court.</p>
                </div>
            </div>
            
            <UnavailabilityClientPage 
                courtId={courtId}
                initialAvailability={sortedAvailability}
                basePath="/livingspace"
            />
        </div>
    );
}
