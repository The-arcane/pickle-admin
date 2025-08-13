
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building } from 'lucide-react';
import { format } from 'date-fns';

type SalesDashboardData = {
    inactiveOrganisations: number;
};

export default function SalesDashboardPage() {
  const [data, setData] = useState<SalesDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function getSalesDashboardData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login?type=sales');
        return;
      }

      const { data: orgsData, error: orgsError } = await supabase
        .from('organisations')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', false);

      if(orgsError) console.error("Error fetching orgs count", orgsError);

      setData({
          inactiveOrganisations: orgsData?.count ?? 0,
      });
      setLoading(false);
    }

    getSalesDashboardData();
  }, [supabase, router]);
  
  const statCards = data ? [
      { label: 'Inactive Organizations', value: data.inactiveOrganisations, icon: Building },
  ] : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Sales Dashboard</h1>
        <p className="text-muted-foreground">A high-level overview of platform-wide activity.</p>
        <p className="text-sm text-muted-foreground mt-2">
            {format(currentDateTime, 'eeee, MMMM d, yyyy, hh:mm:ss a')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
            Array.from({length: 1}).map((_, i) => (
                <Card key={i}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Loading...</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">...</div>
                    </CardContent>
                </Card>
            ))
        ) : (
            statCards.map((stat, i) => (
                <Card key={i}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                    <stat.icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                  </CardContent>
                </Card>
            ))
        )}
      </div>
    </div>
  );
}
