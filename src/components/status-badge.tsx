import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: string }) {
  let variant: "default" | "secondary" | "destructive" | "outline";

  switch (status) {
    case 'Confirmed':
    case 'Open':
    case 'Active':
      variant = 'default';
      break;
    case 'Pending':
    case 'Maintenance':
      variant = 'secondary';
      break;
    case 'Cancelled':
    case 'Closed':
      variant = 'destructive';
      break;
    case 'Inactive':
      variant = 'outline';
      break;
    default:
      variant = 'secondary';
  }

  return <Badge variant={variant}>{status}</Badge>;
}
