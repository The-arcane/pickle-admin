import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: string }) {
  let variant: "default" | "secondary" | "destructive" | "outline";

  // Ensure status is a string before calling toLowerCase
  const safeStatus = typeof status === 'string' ? status.toLowerCase() : '';

  switch (safeStatus) {
    case 'confirmed':
    case 'open':
    case 'active':
    case 'joined':
    case 'upcoming':
      variant = 'default';
      break;
    case 'pending':
    case 'maintenance':
    case 'invited':
    case 'completed':
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
