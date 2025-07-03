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

const courts = [
    { name: "Tennis Court 1", location: "North Wing", type: "Tennis", status: "Available" },
    { name: "Tennis Court 2", location: "North Wing", type: "Tennis", status: "Under Maintenance" },
    { name: "Basketball Court", location: "South Wing", type: "Basketball", status: "Available" },
    { name: "Padel Court 1", location: "East Wing", type: "Padel", status: "Booked" },
    { name: "Padel Court 2", location: "East Wing", type: "Padel", status: "Available" },
]

const statusVariant = (status: string) => {
    if (status === 'Available') return 'default'
    if (status === 'Booked') return 'secondary'
    if (status === 'Under Maintenance') return 'destructive'
    return 'outline'
}


export default function CourtsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Courts</CardTitle>
        <CardDescription>Manage your court listings and their availability.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courts.map((court) => (
              <TableRow key={court.name}>
                <TableCell className="font-medium">{court.name}</TableCell>
                <TableCell>{court.location}</TableCell>
                <TableCell>{court.type}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant(court.status)}>{court.status}</Badge>
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
                      <DropdownMenuItem>Edit Details</DropdownMenuItem>
                      <DropdownMenuItem>Update Availability</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Remove Court</DropdownMenuItem>
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
