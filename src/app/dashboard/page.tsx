import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/status-badge';
import { Calendar, BarChartHorizontal, Clock, MessageSquare } from 'lucide-react';

const bookings = [
  { user: 'Courtney Henry', court: 'East Court', date: 'Apr 30, 2025', time: '5:00 PM', status: 'Confirmed', avatar: 'https://randomuser.me/api/portraits/women/1.jpg' },
  { user: 'Guy Hawkins', court: 'East Court', date: 'Apr 30, 2025', time: '5:00 PM', status: 'Confirmed', avatar: 'https://randomuser.me/api/portraits/men/2.jpg' },
  { user: 'Robert Fox', court: 'West Court', date: 'Apr 30, 2025', time: '7:00 PM', status: 'Pending', avatar: 'https://randomuser.me/api/portraits/men/3.jpg' },
  { user: 'Jacob Jones', court: 'Center Court', date: 'May 01, 2025', time: '6:00 PM', status: 'Confirmed', avatar: 'https://randomuser.me/api/portraits/men/4.jpg' },
  { user: 'Albert Flores', court: 'West Court', date: 'Apr 30, 2025', time: '7:00 PM', status: 'Pending', avatar: 'https://randomuser.me/api/portraits/men/5.jpg' },
  { user: 'Marvin McKinney', court: 'East Court', date: 'Apr 30, 2025', time: '9:00 PM', status: 'Cancelled', avatar: 'https://randomuser.me/api/portraits/men/6.jpg' },
  { user: 'Dianne Russell', court: 'Center Court', date: 'Apr 30, 2025', time: '9:00 PM', status: 'Cancelled', avatar: 'https://randomuser.me/api/portraits/women/7.jpg' },
  { user: 'Devon Lane', court: 'East Court', date: 'Apr 30, 2025', time: '9:00 PM', status: 'Cancelled', avatar: 'https://randomuser.me/api/portraits/men/8.jpg' },
];

const stats = [
  { label: "Today's Bookings", value: 12, icon: Calendar },
  { label: 'Total Revenue', value: '₹18,200', icon: BarChartHorizontal },
  { label: 'Upcoming Slots', value: 6, icon: Clock },
  { label: 'Chatbot Interactions', value: 412, icon: MessageSquare },
];

const chatbotStats = {
  total: 412,
  autoSolved: 25,
  transfers: 6,
  topIntent: 'Booking Inquiry',
};

const feedback = {
  rating: 4.7,
  comment: 'Loved the smooth booking process. Will play again!',
  user: 'Sneha M.'
};

export default function DashboardPage() {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
            Welcome Back, Amit! <span className="text-2xl">👋</span>
          </h1>
          <p className="text-muted-foreground text-sm">Your PickleballBot is running smoothly today.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Customize UI</Button>
          <Button variant="outline">Edit Message</Button>
          <Button>Manage Courts</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Booking Activity</CardTitle>
                <CardDescription>An overview of the latest bookings.</CardDescription>
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead className="hidden sm:table-cell">Court</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead className="hidden md:table-cell">Time</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((b, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={b.avatar} alt={b.user} />
                          <AvatarFallback>{b.user.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{b.user}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{b.court}</TableCell>
                    <TableCell className="hidden md:table-cell">{b.date}</TableCell>
                    <TableCell className="hidden md:table-cell">{b.time}</TableCell>
                    <TableCell>
                      <StatusBadge status={b.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Chatbot Usage Today</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Total Messages Handled</span><span className="font-semibold text-muted-foreground">{chatbotStats.total}</span></div>
              <div className="flex justify-between"><span>Auto-Solved Queries</span><span className="text-muted-foreground">{chatbotStats.autoSolved}</span></div>
              <div className="flex justify-between"><span>Live Support Transfers</span><span className="text-muted-foreground">{chatbotStats.transfers}</span></div>
              <div className="flex justify-between"><span>Top Intent</span><span className="text-muted-foreground">{chatbotStats.topIntent}</span></div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Customer Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-muted-foreground">Average Rating:</span>
                <span className="text-yellow-500 font-bold">★ {feedback.rating}/5</span>
              </div>
              <blockquote className="text-sm italic border-l-2 pl-4">"{feedback.comment}"</blockquote>
              <p className="text-xs text-muted-foreground text-right mt-2">- {feedback.user}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
