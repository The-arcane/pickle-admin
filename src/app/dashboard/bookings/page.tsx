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
import { DebugButton } from '@/components/debug-button';

// 0: Cancelled, 1: Confirmed, 2: Pending
const statusMap: { [key: number]: string } = {
  0: 'Cancelled',
  1: 'Confirmed',
  2: 'Pending',
};

export default async function BookingsPage() {
  const supabase = createServer();
  
  // TEMPORARY QUERY FOR DEBUGGING: Fetches only from the bookings table
  const { data, error } = await supabase.from('bookings').select('*');

  // The data mapping is simplified for the debug query. It will not show joined data.
  const bookings =
    data?.map((booking) => {
      return {
        user: `User ID: ${booking.user_id}`,
        court: `Court ID: ${booking.court_id}`,
        date: `Timeslot ID: ${booking.timeslot_id}`,
        time: 'N/A',
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
        <div className="flex items-center gap-4">
          <DebugButton data={data} error={error} />
          <Button>Add Booking</Button>
        </div>
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
                    No bookings found. Use the "Check Fetch Status" button to diagnose.
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
