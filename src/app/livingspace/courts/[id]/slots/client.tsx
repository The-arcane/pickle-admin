
'use client';

import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { saveUnavailability } from './actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import type { AvailabilityBlock } from '@/app/super-admin/courts/[id]/types';
import { useFormStatus } from 'react-dom';

type UnavailabilityClientPageProps = {
    courtId: number;
    initialAvailability: Partial<AvailabilityBlock>[];
    basePath?: string;
};

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
            {pending ? 'Saving...' : 'Save Unavailability Schedule'}
        </Button>
    )
}

export function UnavailabilityClientPage({ courtId, initialAvailability, basePath = '/livingspace' }: UnavailabilityClientPageProps) {
    const { toast } = useToast();
    const [availability, setAvailability] = useState<Partial<AvailabilityBlock>[]>(initialAvailability);

    useEffect(() => {
        setAvailability(initialAvailability);
    }, [initialAvailability]);

    const handleFormAction = async (formData: FormData) => {
        formData.append('availability', JSON.stringify(availability.filter(a => a.date)));
        formData.append('court_id', courtId.toString());
        formData.append('basePath', basePath);

        const result = await saveUnavailability(formData);
        
        if (result?.error) {
            toast({ variant: "destructive", title: "Error", description: result.error });
        } else {
            toast({ title: "Success", description: result.message });
        }
    };
    
    const handleAddAvailability = () => setAvailability([...availability, { date: null, start_time: null, end_time: null, reason: '' }]);
    const handleRemoveAvailability = (index: number) => setAvailability(availability.filter((_, i) => i !== index));
    const handleAvailabilityChange = (index: number, field: keyof AvailabilityBlock, value: any) => {
        const newAvailability = [...availability] as any[];
        newAvailability[index][field] = value;
        setAvailability(newAvailability);
    };

    return (
        <form action={handleFormAction} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>One-off Unavailability</CardTitle>
                    <CardDescription>
                        Block specific dates and times for maintenance, events, or offline bookings. 
                        Leave times blank to block the entire day.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {availability.map((block, index) => (
                        <div key={block.id || `new-${index}`} className="grid grid-cols-1 md:grid-cols-[1fr_0.75fr_0.75fr_1fr_auto] items-end gap-2 p-2 border rounded-md">
                            <div className="space-y-1.5">
                                <Label>Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button type="button" variant="outline" className={cn("w-full justify-start text-left font-normal", !block.date && "text-muted-foreground")}>
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {block.date ? format(parseISO(block.date), "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={block.date ? parseISO(block.date) : undefined} onSelect={(date) => handleAvailabilityChange(index, 'date', date ? format(date, 'yyyy-MM-dd') : null)} initialFocus/></PopoverContent>
                                </Popover>
                            </div>
                             <div className="space-y-1.5">
                                <Label>Start Time (Optional)</Label>
                                <Input type="time" placeholder="Start (optional)" value={block.start_time ?? ''} onChange={(e) => handleAvailabilityChange(index, 'start_time', e.target.value || null)} />
                            </div>
                             <div className="space-y-1.5">
                                <Label>End Time (Optional)</Label>
                                <Input type="time" placeholder="End (optional)" value={block.end_time ?? ''} onChange={(e) => handleAvailabilityChange(index, 'end_time', e.target.value || null)} />
                            </div>
                             <div className="space-y-1.5">
                                <Label>Reason (Optional)</Label>
                                <Input placeholder="e.g., Maintenance" value={block.reason || ''} onChange={(e) => handleAvailabilityChange(index, 'reason', e.target.value)} />
                            </div>
                            <Button type="button" variant="ghost" size="icon" className="justify-self-end" onClick={() => handleRemoveAvailability(index)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                        </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" className="h-auto py-1.5" onClick={handleAddAvailability}><Plus className="mr-2 h-4 w-4" /> Add Block</Button>
                </CardContent>
            </Card>
            <div className="flex justify-end">
                <SubmitButton />
            </div>
        </form>
    );
}
