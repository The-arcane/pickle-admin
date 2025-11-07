
import { createServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Activity, ArrowRight, CalendarCheck, PartyPopper, Briefcase, Box } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default async function EducationDashboardPage() {
  const supabase = await createServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/login?type=education');
  }

  const { data: userProfile } = await supabase.from('user').select('name').eq('user_uuid', user.id).single();

  // Mock data for the dashboard summary
  const stats = [
    { title: 'Attendance Today', value: '92%', icon: CalendarCheck, color: 'text-green-500', href: '/education/attendance' },
    { title: 'Total Students', value: '152', icon: Users, color: 'text-blue-500', href: '/education/users' },
    { title: 'Faculty on Staff', value: '14', icon: Briefcase, color: 'text-indigo-500', href: '/education/communication' },
    { title: 'Low Stock Items', value: '2', icon: Box, color: 'text-yellow-500', href: '/education/inventory' },
  ];

  const recentActivity = [
    { text: 'New student "Alex Doe" was registered for Grade 5.' },
    { text: 'Attendance marked for "Morning Basketball Practice".' },
    { text: 'Parent-teacher meeting scheduled for next Friday.' },
    { text: 'Emergency alert "Weather Delay" sent to all parents.' },
  ];
  
  const announcements = [
      { title: 'Annual Sports Day', description: 'The annual sports day will be held on December 15th. All students are requested to participate.' },
      { title: 'Mid-term Exams', description: 'The mid-term exams will commence from November 20th. The schedule has been shared via email.' },
  ];
  
  const upcomingEvents = [
      { id: 'event_001', name: 'Annual Pickleball Championship', date: 'in 10 days' },
      { id: 'event_003', name: 'Intra-School League - Week 2', date: 'today' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Welcome, {userProfile?.name ?? 'Admin'}!</h1>
        <p className="text-muted-foreground">Here’s a snapshot of what’s happening at your school today.</p>
      </div>
      
      {/* Academic & Administrative Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Link href={stat.href} key={index}>
            <Card className="hover:bg-muted/50 transition-colors p-4 flex flex-col justify-between h-full">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <stat.icon className={cn("h-6 w-6 text-muted-foreground", stat.color)} />
                </div>
                <div>
                    <p className="text-3xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">+2.1% from last month</p>
                </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Activities & Announcements */}
      <div className="grid gap-6 lg:grid-cols-2">
         <Card>
          <CardHeader>
            <CardTitle>Announcements</CardTitle>
            <CardDescription>Important notices and updates for the school community.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {announcements.map((item, index) => (
                <div key={index} className="p-3 rounded-lg border bg-card-foreground/5">
                    <h4 className="font-semibold">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
            ))}
             <Button asChild variant="outline" size="sm" className="mt-2">
              <Link href="/education/notifications">
                View All Announcements <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>A quick look at scheduled events.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingEvents.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <PartyPopper className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.date}</p>
                  </div>
                   <Button asChild variant="secondary" size="sm">
                    <Link href={`/education/events/${item.id}`}>View</Link>
                  </Button>
                </div>
              ))}
            </div>
             <Button asChild variant="outline" size="sm" className="mt-4">
              <Link href="/education/events">
                View All Events <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
