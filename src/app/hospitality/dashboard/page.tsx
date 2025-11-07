
import { createServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, PlusCircle, Calendar } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

async function getHospitalityDashboardData(organisationId: number) {
    const supabase = await createServer();

    const [
        { count: activePackages, error: packageError },
        { count: totalBookings, error: bookingError }
    ] = await Promise.all([
        supabase
            .from('packages')
            .select('id', { count: 'exact', head: true })
            .eq('organisation_id', organisationId)
            .eq('is_active', true),
        supabase
            .from('package_bookings')
            .select('id', { count: 'exact', head: true })
            .eq('organisation_id', organisationId)
    ]);


    if (packageError) {
        console.error("Error fetching active packages count:", packageError);
    }
    if (bookingError) {
        console.error("Error fetching total bookings count:", bookingError);
    }

    return {
        activePackages: activePackages ?? 0,
        totalBookings: totalBookings ?? 0,
    };
}


export default async function HospitalityDashboardPage() {
  const supabase = await createServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/login?type=hospitality');
  }

  const { data: userProfile } = await supabase.from('user').select('id, name').eq('user_uuid', user.id).single();
  if (!userProfile) {
      return redirect('/login?type=hospitality&error=profile_not_found');
  }

  const { data: orgLink } = await supabase.from('user_organisations').select('organisation_id').eq('user_id', userProfile.id).single();
  if (!orgLink) {
      return (
          <div className="space-y-8 text-center py-10">
              <h1 className="text-2xl font-bold">Welcome, {userProfile.name ?? 'Admin'}!</h1>
              <p className="text-muted-foreground">Your account is not yet linked to a hospitality organization.</p>
          </div>
      );
  }

  const { activePackages, totalBookings } = await getHospitalityDashboardData(orgLink.organisation_id);

  const stats = [
      { label: 'Active Packages', value: activePackages, icon: Package, href: '/hospitality/packages', color: 'text-orange-500', description: 'Currently available packages' },
      { label: 'Total Bookings', value: totalBookings, icon: Calendar, href: '/hospitality/bookings', color: 'text-rose-500', description: 'All-time package bookings' }
  ];


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Welcome, {userProfile.name ?? 'Admin'}!</h1>
        <p className="text-muted-foreground">Here’s a snapshot of your hospitality services.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <Link href={stat.href} key={i} className="lg:col-span-1">
                <Card className="hover:bg-muted/50 transition-colors p-4 flex flex-col justify-between h-full">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                        <stat.icon className={cn("h-6 w-6 text-muted-foreground", stat.color)} />
                    </div>
                    <div>
                        <p className="text-3xl font-bold">{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.description}</p>
                    </div>
                </Card>
            </Link>
          ))}
      </div>

       <Card>
            <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Get started by managing your packages or bookings.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
                <Button asChild>
                    <Link href="/hospitality/packages">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Manage Packages
                    </Link>
                </Button>
                 <Button asChild variant="secondary">
                    <Link href="/hospitality/bookings">
                        <Calendar className="mr-2 h-4 w-4" />
                        View Bookings
                    </Link>
                </Button>
            </CardContent>
        </Card>
    </div>
  );
}
