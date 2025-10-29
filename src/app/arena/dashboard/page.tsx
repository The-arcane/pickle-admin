
import { createServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, PlusCircle, Calendar, Users } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import Image from 'next/image';

async function getArenaDashboardData(organisationId: number) {
    const supabase = await createServer();

    const [
        { count: activeTournaments, error: tournamentError },
        { count: totalBookings, error: bookingError }
    ] = await Promise.all([
        supabase
            .from('events')
            .select('id', { count: 'exact', head: true })
            .eq('organiser_org_id', organisationId)
            .eq('type', 'Tournament'),
        supabase
            .from('bookings')
            .select('id, courts!inner(organisation_id)', { count: 'exact', head: true })
            .eq('courts.organisation_id', organisationId)
    ]);

    if (tournamentError) console.error("Error fetching active tournaments count:", tournamentError);
    if (bookingError) console.error("Error fetching total bookings count:", bookingError);

    return {
        activeTournaments: activeTournaments ?? 0,
        totalBookings: totalBookings ?? 0,
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
              <h1 className="text-3xl font-bold">Welcome, {userProfile.name ?? 'Admin'}!</h1>
              <p className="text-muted-foreground">Your account is not yet linked to an arena.</p>
          </div>
      );
  }
  
  const { data: orgData } = await supabase
    .from('organisations')
    .select('logo')
    .eq('id', orgLink.organisation_id)
    .single();

  const { activeTournaments, totalBookings } = await getArenaDashboardData(orgLink.organisation_id);

  const stats = [
      { label: 'Active Tournaments', value: activeTournaments, icon: Shield, href: '/arena/events', color: 'text-orange-500', description: 'Currently running tournaments' },
      { label: 'Total Bookings', value: totalBookings, icon: Calendar, href: '/arena/bookings', color: 'text-rose-500', description: 'All-time court bookings' }
  ];


  return (
    <div className="space-y-8">
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
          <h1 className="text-3xl font-bold">Welcome, {userProfile.name ?? 'Admin'}!</h1>
          <p className="text-muted-foreground">Here’s a snapshot of your arena's activities.</p>
        </div>
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
                <CardDescription>Get started by managing your events or bookings.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
                <Button asChild>
                    <Link href="/arena/events">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Manage Events
                    </Link>
                </Button>
                 <Button asChild variant="secondary">
                    <Link href="/arena/bookings">
                        <Calendar className="mr-2 h-4 w-4" />
                        View Bookings
                    </Link>
                </Button>
                 <Button asChild variant="secondary">
                    <Link href="/arena/members">
                        <Users className="mr-2 h-4 w-4" />
                        View Members
                    </Link>
                </Button>
            </CardContent>
        </Card>
    </div>
  );
}
