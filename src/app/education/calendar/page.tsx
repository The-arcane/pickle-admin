
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Clock, MapPin, PlusCircle } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';

// Mock Data
const mockEvents = [
    { title: 'Morning Pickleball Drills', date: new Date(), time: '9:00 AM', location: 'Main Court' },
    { title: 'Afternoon Practice Match', date: new Date(), time: '2:00 PM', location: 'Court 2' },
    { title: 'Tournament Day 1', date: new Date(new Date().setDate(new Date().getDate() + 3)), time: '10:00 AM', location: 'All Courts' },
];

export default function CalendarPage() {
    const [date, setDate] = useState<Date | undefined>(new Date());

    const eventsForSelectedDay = mockEvents.filter(
        event => date && event.date.toDateString() === date.toDateString()
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <CalendarIcon className="h-8 w-8 text-blue-500" />
                    <div>
                        <h1 className="text-2xl font-bold">School Calendar</h1>
                        <p className="text-muted-foreground">View all scheduled classes and events.</p>
                    </div>
                </div>
                 <Button className="h-8 text-xs"><PlusCircle className="mr-2 h-4 w-4"/> Add New Entry</Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card>
                        <CardContent className="p-2 sm:p-4">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                className="w-full"
                                classNames={{
                                    day_selected: "text-primary-foreground bg-primary hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                                    day_today: "bg-accent text-accent-foreground",
                                }}
                            />
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                Schedule for {date ? date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : '...'}
                            </CardTitle>
                            <CardDescription>All events and classes for the selected day.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {eventsForSelectedDay.length > 0 ? (
                                <ul className="space-y-4">
                                    {eventsForSelectedDay.map((event, index) => (
                                        <li key={index} className="p-3 border rounded-lg">
                                            <p className="font-semibold">{event.title}</p>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                                <Clock className="h-4 w-4"/>
                                                <span>{event.time}</span>
                                            </div>
                                             <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <MapPin className="h-4 w-4"/>
                                                <span>{event.location}</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-center text-muted-foreground py-8">No events scheduled for this day.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
