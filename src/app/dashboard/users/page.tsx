import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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

const users = [
  { name: 'Amit Kumar', email: 'amit.kumar@email.com', status: 'Active', avatar: 'https://randomuser.me/api/portraits/men/10.jpg' },
  { name: 'Sneha M.', email: 'sneha.m@email.com', status: 'Active', avatar: 'https://randomuser.me/api/portraits/women/11.jpg' },
  { name: 'Robert Fox', email: 'robert.fox@email.com', status: 'Inactive', avatar: 'https://randomuser.me/api/portraits/men/12.jpg' },
  { name: 'Courtney Henry', email: 'courtney.henry@email.com', status: 'Active', avatar: 'https://randomuser.me/api/portraits/women/13.jpg' },
];

export default function UsersPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Users</CardTitle>
        <CardDescription>Manage your users and their permissions.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{user.name}</span>
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <StatusBadge status={user.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
