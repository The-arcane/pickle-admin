import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createServer } from '@/lib/supabase/server';
import { Building, Users, List, PartyPopper } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

async function getSuperAdminDashboardData() {
    const supabase = createServer();

    const [
        orgsRes,
        usersRes,
        courtsRes,
        eventsRes,
        recentOrgsRes,
        recentUsersRes
    ] = await Promise.all([
        supabase.from('organisations').select('id', { count: 'exact', head: true }),
        supabase.from('user').select('id', { count: 'exact', head: true }),
        supabase.from('courts').select('id', { count: 'exact', head: true }),
        supabase.from('events').select('id', { count: 'exact', head: true }),
        supabase.from('organisations').select('id, name, user:user_id(name)').order('id', { ascending: false }).limit(5),
        supabase.from('user').select('id, name, email, created_at, profile_image_url').order('created_at', { ascending: false }).limit(5)
    ]);

    // Error handling
    if(orgsRes.error) console.error("Error fetching orgs count", orgsRes.error);
    if(usersRes.error) console.error("Error fetching users count", usersRes.error);
    if(courtsRes.error) console.error("Error fetching courts count", courtsRes.error);
    if(eventsRes.error) console.error("Error fetching events count", eventsRes.error);
    if(recentOrgsRes.error) console.error("Error fetching recent orgs", recentOrgsRes.error);
    if(recentUsersRes.error) console.error("Error fetching recent users", recentUsersRes.error);

    return {
        totalOrganisations: orgsRes.count ?? 0,
        totalUsers: usersRes.count ?? 0,
        totalCourts: courtsRes.count ?? 0,
        totalEvents: eventsRes.count ?? 0,
        recentOrganisations: recentOrgsRes.data || [],
        recentUsers: recentUsersRes.data || []
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
  const { 
      totalOrganisations, 
      totalUsers, 
      totalCourts, 
      totalEvents,
      recentOrganisations,
      recentUsers
    } = await getSuperAdminDashboardData();
  
  const statCards = [
      { label: 'Total Organizations', value: totalOrganisations, icon: Building, href: '/super-admin/organisations' },
      { label: 'Total Users', value: totalUsers, icon: Users, href: '/super-admin/users' },
      { label: 'Total Courts', value: totalCourts, icon: List, href: '/super-admin/courts' },
      { label: 'Total Events', value: totalEvents, icon: PartyPopper, href: '/super-admin/events' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
        <p className="text-muted-foreground">Welcome! You have the highest level of administrative access.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <Link href={stat.href} key={i} className="hover:no-underline">
            <Card className="hover:bg-muted/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Organizations</CardTitle>
                <Button asChild variant="outline" size="sm"><Link href="/super-admin/organisations">View All</Link></Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Owner</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {recentOrganisations.length > 0 ? recentOrganisations.map((org) => (
                            <TableRow key={org.id}>
                                <TableCell className="font-medium">{org.name}</TableCell>
                                <TableCell>{(org.user as any)?.name ?? 'N/A'}</TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={2} className="text-center h-24">No new organizations.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>

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
  );
}
