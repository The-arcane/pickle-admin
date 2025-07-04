import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
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
    .select('status, user!user_id(name), courts!court_id(name), timeslots!timeslot_id(date, start_time)');

  if (error) {
    console.error('Error fetching bookings:', error.message);
  }

  const bookings =
    data?.map((booking) => {
      const user = booking.user;
      const court = booking.courts;
      const timeslot = booking.timeslots;

      return {
        user: typeof user === 'object' && user !== null && 'name' in user ? (user as any).name : 'N/A',
        court: typeof court === 'object' && court !== null && 'name' in court ? (court as any).name : 'N/A',
        date: typeof timeslot === 'object' && timeslot !== null && 'date' in timeslot ? formatDate((timeslot as any).date) : 'N/A',
        time: typeof timeslot === 'object' && timeslot !== null && 'start_time' in timeslot ? formatTime((timeslot as any).start_time) : 'N/A',
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
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
