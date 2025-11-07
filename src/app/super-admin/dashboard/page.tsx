
import { createServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, List, PartyPopper, School, Hotel, Home, Building, Calendar, ShieldCheck, TrendingUp, Contact2, Briefcase, Shield } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import Link from 'next/link';
import { StatusBadge } from '@/components/status-badge';
import { cn } from '@/lib/utils';


const bookingStatusMap: { [key: number]: string } = {
  0: 'Cancelled',
  1: 'Confirmed',
  2: 'Pending',
};

async function getSuperAdminDashboardData() {
    const supabase = await createServer();
    
    const [
        totalOrgsRes,
        schoolsRes,
        hospitalityRes,
        residencesRes,
        arenaRes,
        usersRes,
        courtsRes,
        eventsRes,
        bookingsRes,
        recentBookingsRes,
        recentUsersRes,
        totalAdminsRes,
        totalSalesRes,
        totalCoachesRes,
        totalEmployeesRes,
    ] = await Promise.all([
        supabase.from('organisations').select('id', { count: 'exact', head: true }),
        supabase.from('organisations').select('id', { count: 'exact', head: true }).eq('type', 2),
        supabase.from('organisations').select('id', { count: 'exact', head: true }).eq('type', 3),
        supabase.from('organisations').select('id', { count: 'exact', head: true }).eq('type', 1),
        supabase.from('organisations').select('id', { count: 'exact', head: true }).eq('type', 4), // Arena
        supabase.from('user').select('id', { count: 'exact', head: true }),
        supabase.from('courts').select('id', { count: 'exact', head: true }),
        supabase.from('events').select('id', { count: 'exact', head: true }),
        supabase.from('bookings').select('id', { count: 'exact', head: true }),
        supabase
          .from('bookings')
          .select(`
              id, 
              booking_status, 
              timeslots:timeslot_id(date), 
              user:user_id(name), 
              courts:court_id(name, organisations(name))
          `)
          .order('id', { ascending: false })
          .limit(5),
        supabase.from('user').select('id, name, email, created_at, profile_image_url').order('created_at', { ascending: false }).limit(5),
        supabase.from('user').select('id', { count: 'exact', head: true }).eq('user_type', 2), // Admins
        supabase.from('user').select('id', { count: 'exact', head: true }).eq('user_type', 6), // Sales
        supabase.from('user').select('id', { count: 'exact', head: true }).eq('user_type', 5), // Coaches
        supabase.from('user').select('id', { count: 'exact', head: true }).eq('user_type', 4), // Employees
    ]);

    // Error handling
    if(totalOrgsRes.error) console.error("Error fetching total orgs count", totalOrgsRes.error);
    if(schoolsRes.error) console.error("Error fetching schools count", schoolsRes.error);
    if(hospitalityRes.error) console.error("Error fetching hospitality count", hospitalityRes.error);
    if(residencesRes.error) console.error("Error fetching residences count", residencesRes.error);
    if(arenaRes.error) console.error("Error fetching arena count", arenaRes.error);
    if(usersRes.error) console.error("Error fetching users count", usersRes.error);
    if(courtsRes.error) console.error("Error fetching courts count", courtsRes.error);
    if(eventsRes.error) console.error("Error fetching events count", eventsRes.error);
    if(bookingsRes.error) console.error("Error fetching bookings count", bookingsRes.error);
    if(recentBookingsRes.error) console.error("Error fetching recent bookings", recentBookingsRes.error);
    if(recentUsersRes.error) console.error("Error fetching recent users", recentUsersRes.error);
    if(totalAdminsRes.error) console.error("Error fetching total admins", totalAdminsRes.error);
    if(totalSalesRes.error) console.error("Error fetching total sales", totalSalesRes.error);
    if(totalCoachesRes.error) console.error("Error fetching total coaches", totalCoachesRes.error);
    if(totalEmployeesRes.error) console.error("Error fetching total employees", totalEmployeesRes.error);

    return {
        totalLivingSpaces: totalOrgsRes.count ?? 0,
        totalSchools: schoolsRes.count ?? 0,
        totalHospitality: hospitalityRes.count ?? 0,
        totalResidences: residencesRes.count ?? 0,
        totalArenas: arenaRes.count ?? 0,
        totalUsers: usersRes.count ?? 0, 
        totalCourts: courtsRes.count ?? 0, 
        totalEvents: eventsRes.count ?? 0,
        totalBookings: bookingsRes.count ?? 0,
        totalAdmins: totalAdminsRes.count ?? 0,
        totalSales: totalSalesRes.count ?? 0,
        totalCoaches: totalCoachesRes.count ?? 0,
        totalEmployees: totalEmployeesRes.count ?? 0,
        recentBookings: recentBookingsRes.data || [],
        recentUsers: recentUsersRes.data || [],
    }
}

const getInitials = (name: string | null) => {
    if (!name) return '';
    const names = name.split(' ').filter(Boolean);
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return names[0]?.substring(0, 2).toUpperCase() ?? '';
};


export default async function SuperAdminDashboardPage() {
  const supabase = await createServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    // This should not happen due to middleware, but as a safeguard.
    return redirect('/super-admin/login');
  }

  const { 
      totalLivingSpaces,
      totalSchools,
      totalHospitality,
      totalResidences,
      totalArenas,
      totalUsers, 
      totalCourts, 
      totalEvents,
      totalBookings,
      totalAdmins,
      totalSales,
      totalCoaches,
      totalEmployees,
      recentBookings,
      recentUsers,
    } = await getSuperAdminDashboardData();
  
  const livingSpaceStats = [
      { label: 'Total Living Spaces', value: totalLivingSpaces, icon: Building, href: '/super-admin/organisations', color: 'text-orange-500' },
      { label: 'Total Schools', value: totalSchools, icon: School, href: '/super-admin/schools', color: 'text-blue-500' },
      { label: 'Total Hospitality', value: totalHospitality, icon: Hotel, href: '/super-admin/hospitality', color: 'text-purple-500' },
      { label: 'Total Residences', value: totalResidences, icon: Home, href: '/super-admin/residences', color: 'text-teal-500' },
      { label: 'Total Arenas', value: totalArenas, icon: Shield, href: '/super-admin/arena', color: 'text-gray-500' },
      { label: 'Total Users', value: totalUsers, icon: Users, href: '/super-admin/users', color: 'text-violet-500' },
  ];
  
  const operationalStats = [
      { label: 'Total Courts', value: totalCourts, icon: List, href: '/super-admin/courts', color: 'text-amber-500' },
      { label: 'Total Bookings', value: totalBookings, icon: Calendar, href: '/super-admin/bookings', color: 'text-rose-500' },
      { label: 'Total Events', value: totalEvents, icon: PartyPopper, href: '/super-admin/events', color: 'text-pink-500' },
  ];

  const platformDataStats = [
      { label: 'Total Admins', value: totalAdmins, icon: ShieldCheck, href: '/super-admin/admins', color: 'text-red-500' },
      { label: 'Total Sales People', value: totalSales, icon: TrendingUp, href: '/super-admin/sales', color: 'text-green-500' },
      { label: 'Total Coaches', value: totalCoaches, icon: Contact2, href: '#', color: 'text-rose-500' },
      { label: 'Total Employees', value: totalEmployees, icon: Briefcase, href: '#', color: 'text-orange-500' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Super Admin Dashboard</h1>
        <p className="text-muted-foreground">A high-level overview of platform-wide activity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {livingSpaceStats.map((stat, i) => (
          <Link href={stat.href} key={i}>
            <Card className="hover:bg-muted/50 transition-colors p-4 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <stat.icon className={cn("h-6 w-6 text-muted-foreground", stat.color)} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
      
      <div>
          <h2 className="text-2xl font-bold tracking-tight">Operational Data</h2>
          <p className="text-muted-foreground">An overview of all operational metrics.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {operationalStats.map((stat, i) => (
          <Link href={stat.href} key={i}>
            <Card className="hover:bg-muted/50 transition-colors p-4 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <stat.icon className={cn("h-6 w-6 text-muted-foreground", stat.color)} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
      
      <div>
          <h2 className="text-2xl font-bold tracking-tight">Platform Data</h2>
          <p className="text-muted-foreground">An overview of all platform-wide user roles.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {platformDataStats.map((stat, i) => (
          <Link href={stat.href} key={i}>
            <Card className="hover:bg-muted/50 transition-colors p-4 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <stat.icon className={cn("h-6 w-6 text-muted-foreground", stat.color)} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Recent Platform Activity</CardTitle>
                        <CardDescription>The latest bookings from across all Living Spaces.</CardDescription>
                    </div>
                    <Button asChild variant="outline" size="sm"><Link href="/super-admin/bookings">View All</Link></Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Court</TableHead>
                                <TableHead>Living Space</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentBookings.length > 0 ? recentBookings.map((booking: any) => (
                                <TableRow key={booking.id}>
                                    <TableCell className="font-medium">{booking.user?.name ?? 'N/A'}</TableCell>
                                    <TableCell>{booking.courts?.name ?? 'N/A'}</TableCell>
                                    <TableCell>{booking.courts?.organisations?.name ?? 'N/A'}</TableCell>
                                    <TableCell>{booking.timeslots?.date ? format(parseISO(booking.timeslots.date), 'PP') : 'N/A'}</TableCell>
                                    <TableCell><StatusBadge status={bookingStatusMap[booking.booking_status] ?? 'Unknown'} /></TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24">No recent bookings.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
        
        <div className="lg:col-span-1">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>New Users</CardTitle>
                    <Button asChild variant="outline" size="sm"><Link href="/super-admin/users">View All</Link></Button>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {recentUsers.length > 0 ? recentUsers.map((user) => (
                            <div key={user.id} className="flex items-center gap-4">
                                <Avatar>
                                    <AvatarImage src={user.profile_image_url || undefined} alt={user.name || ''} />
                                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">{user.name}</p>
                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                </div>
                                <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}</p>
                            </div>
                        )) : (
                            <div className="text-center text-muted-foreground py-10">
                                <p>No new users have signed up recently.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
