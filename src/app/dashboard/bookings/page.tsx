import { MoreHorizontal } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const bookings = [
    { id: "BK001", customer: "John Doe", court: "Tennis Court 1", date: "2024-07-20", time: "10:00 AM", status: "Confirmed", amount: "$50.00" },
    { id: "BK002", customer: "Jane Smith", court: "Basketball Court", date: "2024-07-21", time: "02:00 PM", status: "Pending", amount: "$75.00" },
    { id: "BK003", customer: "Mike Johnson", court: "Tennis Court 2", date: "2024-07-21", time: "04:00 PM", status: "Cancelled", amount: "$50.00" },
    { id: "BK004", customer: "Emily Davis", court: "Padel Court 1", date: "2024-07-22", time: "09:00 AM", status: "Confirmed", amount: "$40.00" },
    { id: "BK005", customer: "Chris Brown", court: "Basketball Court", date: "2024-07-22", time: "11:00 AM", status: "Confirmed", amount: "$75.00" },
]

const statusVariant = (status: string) => {
    if (status === 'Confirmed') return 'default'
    if (status === 'Pending') return 'secondary'
    if (status === 'Cancelled') return 'destructive'
    return 'outline'
}


export default function BookingsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bookings</CardTitle>
        <CardDescription>Manage your bookings here.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Court</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell className="font-medium">{booking.id}</TableCell>
                <TableCell>{booking.customer}</TableCell>
                <TableCell>{booking.court}</TableCell>
                <TableCell>{booking.date}</TableCell>
                <TableCell>{booking.time}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant(booking.status)}>{booking.status}</Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Cancel</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
