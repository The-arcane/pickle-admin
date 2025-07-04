import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatusBadge } from '@/components/status-badge';
import { createServer } from '@/lib/supabase/server';

// 0: Cancelled, 1: Confirmed, 2: Pending
const statusMap: { [key: number]: string } = {
  0: 'Cancelled',
  1: 'Confirmed',
  2: 'Pending',
};

const formatTime = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export default async function BookingsPage() {
  const supabase = createServer();
  const { data, error } = await supabase
    .from('bookings')
    .select(
      'status, user:user_id(name), courts:court_id(name), timeslots:timeslot_id(date, start_time)'
    );

  if (error) {
    console.error('Error fetching bookings:', error);
  }

  const bookings =
    data?.map((booking) => {
      const user = booking.user as { name: string } | null;
      const court = booking.courts as { name: string } | null;
      const timeslot = booking.timeslots as { date: string | null; start_time: string | null } | null;
      const userName = user?.name ?? 'N/A';

      return {
        user: userName,
        court: court?.name ?? 'N/A',
        date: formatDate(timeslot?.date),
        time: formatTime(timeslot?.start_time),
        status: statusMap[booking.status] ?? 'Unknown',
      };
    }) || [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bookings</h1>
          <p className="text-muted-foreground">A list of all recent bookings.</p>
        </div>
        <Button>Add Booking</Button>
      </div>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Court</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{booking.user}</TableCell>
                  <TableCell>{booking.court}</TableCell>
                  <TableCell>{booking.date}</TableCell>
                  <TableCell>{booking.time}</TableCell>
                  <TableCell>
                    <StatusBadge status={booking.status} />
                  </TableCell>
                </TableRow>
              ))}
              {bookings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No bookings found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
