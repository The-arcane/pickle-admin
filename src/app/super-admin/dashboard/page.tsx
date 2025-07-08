import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createServer } from '@/lib/supabase/server';
import { Building, Users, List, PartyPopper } from 'lucide-react';

async function getSuperAdminDashboardData() {
    const supabase = createServer();

    const [
        orgsRes,
        usersRes,
        courtsRes,
        eventsRes
    ] = await Promise.all([
        supabase.from('organisations').select('id', { count: 'exact', head: true }),
        supabase.from('user').select('id', { count: 'exact', head: true }),
        supabase.from('courts').select('id', { count: 'exact', head: true }),
        supabase.from('events').select('id', { count: 'exact', head: true })
    ]);

    if(orgsRes.error) console.error("Error fetching orgs count", orgsRes.error);
    if(usersRes.error) console.error("Error fetching users count", usersRes.error);
    if(courtsRes.error) console.error("Error fetching courts count", courtsRes.error);
    if(eventsRes.error) console.error("Error fetching events count", eventsRes.error);

    return {
        totalOrganisations: orgsRes.count ?? 0,
        totalUsers: usersRes.count ?? 0,
        totalCourts: courtsRes.count ?? 0,
        totalEvents: eventsRes.count ?? 0,
    }
}


export default async function SuperAdminDashboardPage() {
  const { totalOrganisations, totalUsers, totalCourts, totalEvents } = await getSuperAdminDashboardData();
  
  const statCards = [
      { label: 'Total Organizations', value: totalOrganisations, icon: Building },
      { label: 'Total Users', value: totalUsers, icon: Users },
      { label: 'Total Courts', value: totalCourts, icon: List },
      { label: 'Total Events', value: totalEvents, icon: PartyPopper },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
        <p className="text-muted-foreground">Welcome! You have the highest level of administrative access.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
    </div>
  );
}
