
import { createServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, List, Calendar, PartyPopper, Shield, BarChartHorizontal, UserCheck, Home, Radio, Contact2, MapPin } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { RecentBookingsTable } from '@/components/recent-bookings-table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';


const bookingStatusMap: { [key: number]: string } = {
  0: 'Cancelled',
  1: 'Confirmed',
  2: 'Pending',
};

const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
        return format(parseISO(dateString), 'MMM d, yyyy');
    } catch (e) {
        return 'N/A';
    }
};

const getInitials = (name: string | null) => {
    if (!name) return '';
    const names = name.split(' ').filter(Boolean);
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return names[0]?.substring(0, 2).toUpperCase() ?? '';
};


async function getArenaDashboardData(organisationId: number) {
    const supabase = await createServer();
    const today = new Date().toISOString().split('T')[0];

    const [
        todaysBookingsRes,
        totalRevenueRes,
        totalCourtsRes,
        totalEventsRes,
        recentBookingsRes,
        upcomingEventsRes,
        latestReviewRes,
        avgRatingRes,
    ] = await Promise.all([
        supabase
            .from('bookings')
            .select('id, timeslots!inner(date), courts!inner(id)', { count: 'exact', head: true })
            .eq('timeslots.date', today)
            .in('booking_status', [1, 2])
            .eq('courts.organisation_id', organisationId),
        supabase
            .from('bookings')
            .select('courts!inner(price)')
            .eq('booking_status', 1)
            .eq('courts.organisation_id', organisationId),
        supabase
            .from('courts')
            .select('id', { count: 'exact', head: true })
            .eq('organisation_id', organisationId),
        supabase
            .from('events')
            .select('id', { count: 'exact', head: true })
            .eq('organiser_org_id', organisationId),
         supabase
            .from('bookings')
            .select('id, booking_status, user:user_id(name, profile_image_url), courts:court_id!inner(name), timeslots:timeslot_id(date, start_time)')
            .eq('courts.organisation_id', organisationId)
            .limit(5)
            .order('id', { ascending: false }),
        supabase
            .from('events')
            .select('id, title, start_time, location_name')
            .eq('organiser_org_id', organisationId)
            .gte('end_time', new Date().toISOString())
            .order('start_time', { ascending: true })
            .limit(3),
        supabase
            .from('court_reviews')
            .select('review_text, reviewer_name, rating')
            .order('review_date', { ascending: false })
            .limit(1)
            .maybeSingle(),
        supabase
            .from('court_reviews')
            .select('rating'),
    ]);

    const recentBookings = recentBookingsRes.data?.map((booking) => {
        const user = booking.user;
        const court = booking.courts;
        const timeslot = booking.timeslots;
        const userName = typeof user === 'object' && user !== null && 'name' in user ? (user as any).name : 'N/A';

        return {
        id: booking.id,
        user: userName,
        court: typeof court === 'object' && court !== null && 'name' in court ? (court as any).name : 'N/A',
        date: typeof timeslot === 'object' && timeslot !== null && 'date' in timeslot ? formatDate((timeslot as any).date) : 'N/A',
        time: typeof timeslot === 'object' && timeslot !== null && 'start_time' in timeslot ? (timeslot as any).start_time as string : '',
        status: bookingStatusMap[booking.booking_status] ?? 'Unknown',
        avatar: typeof user === 'object' && user !== null && 'profile_image_url' in user ? (user as any).profile_image_url as string | null : null,
        initials: getInitials(userName),
        };
    }) || [];

    const totalRevenue = totalRevenueRes.data?.reduce(
      (acc, item) => acc + ((item.courts as any)?.price || 0), 
      0) ?? 0;

    const ratings = avgRatingRes.data?.map(r => r.rating).filter(r => r !== null) as number[] || [];
    const averageRating = ratings.length > 0
        ? (ratings.reduce((acc, r) => acc + r, 0) / ratings.length)
        : 0;

    return {
        stats: {
            todaysBookings: todaysBookingsRes.count ?? 0,
            totalRevenue: totalRevenue,
            totalCourts: totalCourtsRes.count ?? 0,
            totalEvents: totalEventsRes.count ?? 0,
        },
        recentBookings,
        upcomingEvents: upcomingEventsRes.data || [],
        feedback: {
            comment: latestReviewRes.data?.review_text || 'No reviews yet.',
            user: latestReviewRes.data?.reviewer_name || '',
            rating: parseFloat(averageRating.toFixed(1)),
        },
        error: recentBookingsRes.error,
    };
}


export default async function ArenaDashboardPage() {
  const supabase = await createServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/login?type=arena');
  }

  const { data: userProfile } = await supabase.from('user').select('id, name').eq('user_uuid', user.id).single();
  if (!userProfile) {
      return redirect('/login?type=arena&error=profile_not_found');
  }

  const { data: orgLink } = await supabase.from('user_organisations').select('organisation_id').eq('user_id', userProfile.id).single();
  if (!orgLink) {
      return (
          <div className="space-y-8 text-center py-10">
              <h1 className="text-2xl font-bold">Welcome, {userProfile.name ?? 'Admin'}!</h1>
              <p className="text-muted-foreground">Your account is not yet linked to an arena.</p>
          </div>
      );
  }
  
  const { data: orgData } = await supabase
    .from('organisations')
    .select('logo')
    .eq('id', orgLink.organisation_id)
    .single();

  const { stats, recentBookings, upcomingEvents, feedback, error } = await getArenaDashboardData(orgLink.organisation_id);

  const primaryStats = [
      { label: "Today's Bookings", value: stats.todaysBookings, icon: Calendar, color: 'text-sky-500' },
      { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`, icon: BarChartHorizontal, color: 'text-green-500' },
  ];

  const activityStats = [
    { label: 'Total Courts', value: stats.totalCourts, icon: List, color: 'text-amber-500' },
    { label: 'Total Events', value: stats.totalEvents, icon: PartyPopper, color: 'text-rose-500' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
            {orgData?.logo && (
                <Image
                    src={orgData.logo}
                    alt="Arena Logo"
                    width={40}
                    height={40}
                    className="rounded-md object-cover"
                    data-ai-hint="logo"
                />
            )}
            <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Here’s a snapshot of your arena's activities.</p>
            </div>
        </div>
        <Link href="/arena/bookings" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto h-8 text-xs">+ New Booking</Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {primaryStats.map((stat, i) => (
          <Card key={i} className="hover:bg-muted/50 transition-colors p-4 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <stat.icon className={cn("h-6 w-6 text-muted-foreground", stat.color)} />
            </div>
            <div>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

       <Card>
            <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Quickly jump to key management areas.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
                <Button asChild className="flex-grow bg-rose-100 text-rose-800 hover:bg-rose-200 dark:bg-rose-900/50 dark:text-rose-300 dark:hover:bg-rose-900/80 focus-visible:ring-rose-500"><Link href="/arena/bookings"><Calendar className="mr-2 h-4 w-4" />Bookings</Link></Button>
                <Button asChild className="flex-grow bg-pink-100 text-pink-800 hover:bg-pink-200 dark:bg-pink-900/50 dark:text-pink-300 dark:hover:bg-pink-900/80 focus-visible:ring-pink-500"><Link href="/arena/events"><PartyPopper className="mr-2 h-4 w-4" />Events</Link></Button>
                <Button asChild className="flex-grow bg-violet-100 text-violet-800 hover:bg-violet-200 dark:bg-violet-900/50 dark:text-violet-300 dark:hover:bg-violet-900/80 focus-visible:ring-violet-500"><Link href="/arena/members"><Users className="mr-2 h-4 w-4" />Members</Link></Button>
                <Button asChild className="flex-grow bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/50 dark:text-amber-300 dark:hover:bg-amber-900/80 focus-visible:ring-amber-500"><Link href="/arena/courts"><List className="mr-2 h-4 w-4" />Courts</Link></Button>
                <Button asChild className="flex-grow bg-indigo-100 text-indigo-800 hover:bg-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:hover:bg-indigo-900/80 focus-visible:ring-indigo-500"><Link href="/arena/channels"><Radio className="mr-2 h-4 w-4" />Channels</Link></Button>
                <Button asChild className="flex-grow bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900/50 dark:text-purple-300 dark:hover:bg-purple-900/80 focus-visible:ring-purple-500"><Link href="/arena/coaches"><Contact2 className="mr-2 h-4 w-4" />Coaches</Link></Button>
            </CardContent>
        </Card>

      <div>
          <h2 className="text-2xl font-bold tracking-tight">Activity Metrics</h2>
          <p className="text-muted-foreground">An overview of facility engagement.</p>
      </div>

       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {activityStats.map((stat, i) => (
          <Card key={i} className="hover:bg-muted/50 transition-colors p-4 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <stat.icon className={cn("h-6 w-6 text-muted-foreground", stat.color)} />
            </div>
            <div>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Recent Booking Activity</CardTitle>
                    <CardDescription>An overview of the latest bookings.</CardDescription>
                </CardHeader>
                <CardContent>
                    {error ? (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error Fetching Bookings</AlertTitle>
                        <AlertDescription>
                        Could not load recent bookings. Please check your connection or database policies.
                        </AlertDescription>
                    </Alert>
                    ) : (
                    <RecentBookingsTable bookings={recentBookings} />
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle>Upcoming Events</CardTitle>
                            <CardDescription>Here&apos;s what&apos;s happening soon at your facility.</CardDescription>
                        </div>
                        <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
                            <Link href="/arena/events">View All</Link>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                     {upcomingEvents.length > 0 ? (
                        <div className="space-y-4">
                            {upcomingEvents.map(event => (
                                <div key={event.id} className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 p-3 rounded-lg border">
                                    <div className="flex-1 space-y-1">
                                        <p className="font-semibold">{event.title}</p>
                                        <div className="flex flex-col sm:flex-row sm:items-center text-sm text-muted-foreground gap-x-4 gap-y-1">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="h-4 w-4" />
                                                <span>{format(new Date(event.start_time), 'E, MMM d, yyyy @ p')}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="h-4 w-4" />
                                                <span>{event.location_name}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button asChild variant="secondary" size="sm" className="shrink-0 w-full sm:w-auto">
                                        <Link href={`/arena/events/${event.id}`}>View Details</Link>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-muted-foreground py-8">
                            <p>No upcoming events.</p>
                            <Button asChild variant="link">
                                <Link href="/arena/events/add">Create one now</Link>
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-muted-foreground">Average Rating:</span>
                <span className="text-yellow-500 font-bold">★ {feedback.rating}/5</span>
              </div>
              <blockquote className="text-sm italic border-l-2 pl-4">"{feedback.comment}"</blockquote>
              {feedback.user && (
                <p className="text-xs text-muted-foreground text-right mt-2">- {feedback.user}</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
