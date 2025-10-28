
'use client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useOrganization } from '@/hooks/use-organization';
import { Skeleton } from '@/components/ui/skeleton';
import { Building, Calendar, Home, List, PartyPopper, Users } from 'lucide-react';
import { usePathname } from 'next/navigation';

type PageConfig = {
  [key: string]: {
    icon: React.ElementType;
    color: string;
  };
};

const pageConfig: PageConfig = {
  '/super-admin/organisations': { icon: Building, color: 'text-orange-500' },
  '/super-admin/users': { icon: Users, color: 'text-violet-500' },
  '/super-admin/courts': { icon: List, color: 'text-amber-500' },
  '/super-admin/bookings': { icon: Calendar, color: 'text-rose-500' },
  '/super-admin/events': { icon: PartyPopper, color: 'text-pink-500' },
  '/super-admin/invitations': { icon: Home, color: 'text-teal-500' },
};

export function PageHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const pathname = usePathname();
  const config = Object.keys(pageConfig).find(key => pathname.startsWith(key));
  const Icon = config ? pageConfig[config].icon : Building;
  const color = config ? pageConfig[config].color : 'text-orange-500';


  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Icon className={`h-8 w-8 ${color}`} />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="pb-px">
        <OrganizationSelect />
      </div>
    </div>
  );
}

function OrganizationSelect() {
  const { organizations, selectedOrgId, setSelectedOrgId, loading } = useOrganization();

  if (loading) {
    return <Skeleton className="h-10 w-[180px]" />;
  }

  return (
    <Select
      value={selectedOrgId?.toString()}
      onValueChange={(value) => setSelectedOrgId(parseInt(value))}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select Living Space" />
      </SelectTrigger>
      <SelectContent>
        {organizations.map((org) => (
          <SelectItem key={org.id} value={org.id.toString()}>
            {org.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
