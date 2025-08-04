
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

export function PageHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <OrganizationSelect />
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
        <SelectValue placeholder="Select Organization" />
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
