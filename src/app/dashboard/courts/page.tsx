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

const courts = [
  { name: 'Pickleball Court 01', venue: 'Uniworld Pickleball Complex', type: 'Indoor', maxPlayers: 'Single', status: 'Open' },
  { name: 'Court A – Smash Zone', venue: 'SmashArena Sports Club', type: 'Outdoor', maxPlayers: 'Dabal', status: 'Closed' },
  { name: 'Court B – Paddle Peak', venue: 'The Paddle Hub', type: 'Indoor', maxPlayers: 'Single', status: 'Maintenance' },
  { name: 'Badminton Court 01', venue: 'NetZone Playgrounds', type: 'Outdoor', maxPlayers: 'Dabal', status: 'Open' },
  { name: 'Court C – Rally Deck', venue: 'Uniworld Pickleball Complex', type: 'Indoor', maxPlayers: 'Single', status: 'Open' },
  { name: 'Court D – Net Square', venue: 'AceCourt Athletic Center', type: 'Indoor', maxPlayers: 'Single', status: 'Closed' },
  { name: 'Court E – PowerPlay Court', venue: 'Uniworld Pickleball Complex', type: 'Indoor', maxPlayers: 'Double', status: 'Open' },
  { name: 'Court F – East Wing Arena', venue: 'Urban Rally Grounds', type: 'Outdoor', maxPlayers: 'Single', status: 'Maintenance' },
  { name: 'Court G – SpinSide Court', venue: 'The Paddle Hub', type: 'Indoor', maxPlayers: 'Single', status: 'Open' },
  { name: 'Court H – SpeedLane Court', venue: 'Uniworld Pickleball Complex', type: 'Indoor', maxPlayers: 'Single', status: 'Open' },
];

export default function CourtListPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Courts</h1>
          <p className="text-muted-foreground">Manage your court listings and availability.</p>
        </div>
        <Button>Add Court</Button>
      </div>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Court</TableHead>
                <TableHead>Venue</TableHead>
                <TableHead>Court Type</TableHead>
                <TableHead>Max Players</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courts.map((court, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{court.name}</TableCell>
                  <TableCell>{court.venue}</TableCell>
                  <TableCell>{court.type}</TableCell>
                  <TableCell>{court.maxPlayers}</TableCell>
                  <TableCell>
                    <StatusBadge status={court.status} />
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
