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

const bookings = [
  { user: 'Amit Kumar', court: 'East Court', date: 'Apr 30, 2025', time: '5:00 PM', status: 'Confirmed' },
  { user: 'Sneha M.', court: 'West Court', date: 'Apr 30, 2025', time: '7:00 PM', status: 'Pending' },
  { user: 'Robert Fox', court: 'Center Court', date: 'May 01, 2025', time: '6:00 PM', status: 'Cancelled' },
];

export default function BookingsPage() {
  return (
    <>
      <div className="flex items-center justify-between mb-6">
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
    </>
  );
}