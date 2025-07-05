import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, BarChartHorizontal, Clock, MessageSquare, AlertCircle, MapPin } from 'lucide-react';
import { createServer } from '@/lib/supabase/server';
import { format, parseISO } from 'date-fns';
import { RecentBookingsTable } from '@/components/recent-bookings-table';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const statusMap: { [key: number]: string } = {
  0: 'Cancelled',
  1: 'Confirmed',
  2: 'Pending',
};

const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
        // Use parseISO to correctly handle date strings without timezones
        return format(parseISO(dateString), 'MMM d, yyyy');
    } catch (e) {
        return 'N/A';
    }
};

const getInitials = (name: string) => {
    if (!name) return '';
    const names = name.split(' ').filter(Boolean);
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return names[0]?.substring(0, 2).toUpperCase() ?? '';
};

async function getDashboardData() {
  const supabase = createServer();
  const today = new Date().toISOString().split('T')[0];

  const [
    recentBookingsRes,
    todaysBookingsRes,
    totalRevenueRes,
    upcomingBookingsRes,
    latestReviewRes,
    avgRatingRes,
    upcomingEventsRes
  ] = await Promise.all([
    // Recent Bookings
    supabase
      .from('bookings')
      .select('id, status, user:user_id(name, profile_image_url), courts:court_id(name), timeslots:timeslot_id(date, start_time)')
      .limit(5)
      .order('id', { ascending: false }),

    // Today's Bookings Count
    supabase
        .from('bookings')
        .select('id, timeslots!inner(date)', { count: 'exact', head: true })
        .eq('timeslots.date', today)
        .in('status', [1, 2]), // Confirmed or Pending
    
    // Total Revenue
    supabase
        .from('bookings')
        .select('courts(price)')
        .eq('status', 1), // Confirmed

    // Upcoming Bookings Count
    supabase
        .from('bookings')
        .select('id, timeslots!inner(date)', { count: 'exact', head: true })
        .eq('status', 1) // Confirmed
        .gte('timeslots.date', today),

    // Latest review
    supabase
        .from('court_reviews')
        .select('review_text, reviewer_name, rating')
        .order('review_date', { ascending: false })
        .limit(1)
        .maybeSingle(),

    // All ratings for average calculation
    supabase
        .from('court_reviews')
        .select('rating'),

    // Upcoming Events
    supabase
        .from('events')
        .select('id, title, start_time, location_name')
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(3)
  ]);

  if (recentBookingsRes.error) console.error("Error fetching recent bookings:", recentBookingsRes.error.message);
  if (todaysBookingsRes.error) console.error("Error fetching today's bookings:", todaysBookingsRes.error.message);
  if (totalRevenueRes.error) console.error("Error fetching total revenue:", totalRevenueRes.error.message);
  if (upcomingBookingsRes.error) console.error("Error fetching upcoming bookings:", upcomingBookingsRes.error.message);
  if (latestReviewRes.error) console.error("Error fetching latest review:", latestReviewRes.error.message);
  if (avgRatingRes.error) console.error("Error fetching ratings:", avgRatingRes.error.message);
  if (upcomingEventsRes.error) console.error("Error fetching upcoming events:", upcomingEventsRes.error.message);


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
      status: statusMap[booking.status] ?? 'Unknown',
      avatar: typeof user === 'object' && user !== null && 'profile_image_url' in user ? (user as any).profile_image_url as string | null : null,
      initials: getInitials(userName),
    };
  }) || [];
  
  const todaysBookingsCount = todaysBookingsRes.count ?? 0;
  
  const totalRevenue = totalRevenueRes.data?.reduce(
      (acc, item) => acc + (item.courts?.price || 0), 
  0) ?? 0;
  
  const upcomingBookingsCount = upcomingBookingsRes.count ?? 0;
  
  const latestReview = latestReviewRes.data ? {
      comment: latestReviewRes.data.review_text,
      user: latestReviewRes.data.reviewer_name,
  } : {
      comment: 'No reviews yet. Be the first to leave one!',
      user: '',
  };

  const ratings = avgRatingRes.data?.map(r => r.rating).filter(r => r !== null) as number[] || [];
  const averageRating = ratings.length > 0
      ? (ratings.reduce((acc, r) => acc + r, 0) / ratings.length)
      : 0;

  const upcomingEvents = upcomingEventsRes.data?.map(event => ({
    id: event.id,
    title: event.title,
    startTime: event.start_time,
    location: event.location_name ?? 'N/A',
  })) || [];

  return {
    recentBookings,
    stats: {
        todaysBookings: todaysBookingsCount,
        totalRevenue: totalRevenue,
        upcomingSlots: upcomingBookingsCount,
        chatbotInteractions: 412, // This is static as there is no data source
    },
    feedback: {
        ...latestReview,
        rating: parseFloat(averageRating.toFixed(1)),
    },
    upcomingEvents,
    error: recentBookingsRes.error,
  };
}

export default async function DashboardPage() {
  const { recentBookings, stats, feedback, upcomingEvents, error } = await getDashboardData();
  
  const statCards = [
    { label: "Today's Bookings", value: stats.todaysBookings, icon: Calendar },
    { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`, icon: BarChartHorizontal },
    { label: 'Upcoming Slots', value: stats.upcomingSlots, icon: Clock },
    { label: 'Chatbot Interactions', value: stats.chatbotInteractions, icon: MessageSquare },
  ];

  // This remains static as no data source was provided for it.
  const chatbotStats = {
    total: 412,
    autoSolved: 25,
    transfers: 6,
    topIntent: 'Booking Inquiry',
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Here&apos;s a snapshot of your facility&apos;s activity.</p>
        </div>
        <Link href="/dashboard/bookings">
            <Button>+ New Booking</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Recent Booking Activity</CardTitle>
                        <CardDescription>An overview of the latest bookings.</CardDescription>
                    </div>
                    <Select defaultValue="all">
                        <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Filter" />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                    </div>
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
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Upcoming Events</CardTitle>
                            <CardDescription>Here's what's happening soon at your facility.</CardDescription>
                        </div>
                        <Button asChild variant="outline" size="sm">
                            <Link href="/dashboard/events">View All</Link>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                     {upcomingEvents.length > 0 ? (
                        <div className="space-y-4">
                            {upcomingEvents.map(event => (
                                <div key={event.id} className="flex items-start justify-between gap-4 p-3 rounded-lg border">
                                    <div className="flex-1 space-y-1">
                                        <p className="font-semibold">{event.title}</p>
                                        <div className="flex flex-col sm:flex-row sm:items-center text-sm text-muted-foreground gap-x-4 gap-y-1">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="h-4 w-4" />
                                                <span>{format(new Date(event.startTime), 'E, MMM d, yyyy @ p')}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="h-4 w-4" />
                                                <span>{event.location}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button asChild variant="secondary" size="sm" className="shrink-0">
                                        <Link href={`/dashboard/events/${event.id}`}>View Details</Link>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-muted-foreground py-8">
                            <p>No upcoming events.</p>
                            <Button asChild variant="link">
                                <Link href="/dashboard/events/add">Create one now</Link>
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Chatbot Usage Today</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Total Messages Handled</span><span className="font-semibold text-muted-foreground">{chatbotStats.total}</span></div>
              <div className="flex justify-between"><span>Auto-Solved Queries</span><span className="text-muted-foreground">{chatbotStats.autoSolved}</span></div>
              <div className="flex justify-between"><span>Live Support Transfers</span><span className="text-muted-foreground">{chatbotStats.transfers}</span></div>
              <div className="flex justify-between"><span>Top Intent</span><span className="text-muted-foreground">{chatbotStats.topIntent}</span></div>
            </CardContent>
          </Card>
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
    </>
  );
}
