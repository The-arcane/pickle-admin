
import { createServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, PlusCircle, Calendar } from 'lucide-react';
import Link from 'next/link';

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
              <h1 className="text-3xl font-bold">Welcome, {userProfile.name ?? 'Admin'}!</h1>
              <p className="text-muted-foreground">Your account is not yet linked to a hospitality organization.</p>
          </div>
      );
  }

  const { activePackages, totalBookings } = await getHospitalityDashboardData(orgLink.organisation_id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Welcome, {userProfile.name ?? 'Admin'}!</h1>
        <p className="text-muted-foreground">Here’s a snapshot of your hospitality services.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Packages</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{activePackages}</div>
                <p className="text-xs text-muted-foreground">Currently available packages</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{totalBookings}</div>
                <p className="text-xs text-muted-foreground">All-time package bookings received</p>
            </CardContent>
          </Card>
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
