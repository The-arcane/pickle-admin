
import { createServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, Users } from 'lucide-react';

async function getSalesDashboardData() {
    const supabase = await createServer();

    const [
        orgsRes,
        usersRes,
    ] = await Promise.all([
        supabase.from('organisations').select('id', { count: 'exact', head: true }),
        supabase.from('user').select('id', { count: 'exact', head: true }),
    ]);

    if(orgsRes.error) console.error("Error fetching orgs count", orgsRes.error);
    if(usersRes.error) console.error("Error fetching users count", usersRes.error);

    return {
        totalOrganisations: orgsRes.count ?? 0,
        totalUsers: usersRes.count ?? 0,
    }
}


export default async function SalesDashboardPage() {
  const supabase = await createServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/login?type=sales');
  }

  const { 
      totalOrganisations, 
      totalUsers, 
    } = await getSalesDashboardData();
  
  const statCards = [
      { label: 'Total Organizations', value: totalOrganisations, icon: Building },
      { label: 'Total Users', value: totalUsers, icon: Users },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Sales Dashboard</h1>
        <p className="text-muted-foreground">A high-level overview of platform-wide activity.</p>
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
