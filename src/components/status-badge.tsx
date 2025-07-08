import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: string }) {
  let variant: "default" | "secondary" | "destructive" | "outline";

  switch (status?.toLowerCase()) {
    case 'confirmed':
    case 'open':
    case 'active':
    case 'joined':
      variant = 'default';
      break;
    case 'pending':
    case 'maintenance':
    case 'invited':
      variant = 'secondary';
      break;
    case 'cancelled':
    case 'closed':
      variant = 'destructive';
      break;
    case 'inactive':
      variant = 'outline';
      break;
    default:
      variant = 'secondary';
  }

  return <Badge variant={variant} className="capitalize">{status}</Badge>;
}
