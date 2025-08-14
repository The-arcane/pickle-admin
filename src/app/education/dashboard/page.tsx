
import { createServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Activity, ArrowRight, CalendarCheck, PartyPopper, Trophy, LineChart, AlertTriangle, Box, HeartPulse } from 'lucide-react';
import Link from 'next/link';

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
    { title: 'Upcoming Events', value: '3', icon: PartyPopper, color: 'text-pink-500', href: '/education/events' },
    { title: 'Active Injuries', value: '1', icon: HeartPulse, color: 'text-red-500', href: '/education/health' },
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
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Welcome, {userProfile?.name ?? 'Admin'}!</h1>
        <p className="text-muted-foreground">Here’s a snapshot of what’s happening at your school today.</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Link href={stat.href} key={index}>
          <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 text-muted-foreground ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">+2.1% from last month</p>
            </CardContent>
          </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
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
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>A log of the latest actions and events.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                    <Activity className="h-3 w-3 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">{item.text}</p>
                </div>
              ))}
            </div>
             <Button asChild variant="outline" size="sm" className="mt-4">
              <Link href="/education/reports">
                <LineChart className="mr-2 h-4 w-4" /> View Full Report
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
