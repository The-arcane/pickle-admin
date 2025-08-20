
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import Link from 'next/link';

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
      { label: 'Inactive Living Spaces', value: data.inactiveOrganisations, icon: Building, href: '/sales/organisations', color: 'text-orange-500' },
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
                <Card key={i} className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="h-4 w-24 bg-muted rounded-md" />
                        <div className="h-6 w-6 bg-muted rounded-md" />
                    </div>
                    <div>
                        <div className="h-8 w-12 bg-muted rounded-md mt-2" />
                    </div>
                </Card>
            ))
        ) : (
            statCards.map((stat, i) => (
                <Link href={stat.href} key={i}>
                    <Card className="hover:bg-muted/50 transition-colors p-4 flex flex-col justify-between h-full">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                        <stat.icon className={cn("h-6 w-6 text-muted-foreground", stat.color)} />
                    </div>
                    <div>
                        <p className="text-3xl font-bold">{stat.value}</p>
                    </div>
                    </Card>
              </Link>
            ))
        )}
      </div>
    </div>
  );
}
