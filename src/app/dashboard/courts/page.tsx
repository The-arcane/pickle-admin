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
import { createServer } from '@/lib/supabase/server';

export default async function CourtListPage() {
  const supabase = createServer();
  const { data, error } = await supabase
    .from('courts')
    .select('name, organisations(name), sports(name, max_players)');

  if (error) {
    console.error('Error fetching courts:', error);
  }

  const courts =
    data?.map((court) => {
      const organisation = court.organisations;
      const sport = court.sports;

      return {
        name: court.name,
        venue: typeof organisation === 'object' && organisation !== null && 'name' in organisation ? (organisation as any).name : 'N/A',
        type: typeof sport === 'object' && sport !== null && 'name' in sport ? (sport as any).name : 'N/A',
        maxPlayers: typeof sport === 'object' && sport !== null && 'max_players' in sport ? (sport as any).max_players : 'N/A',
      };
    }) || [];

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
              </TableRow>
            </TableHeader>
            <TableBody>
              {courts.map((court, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{court.name}</TableCell>
                  <TableCell>{court.venue}</TableCell>
                  <TableCell>{court.type}</TableCell>
                  <TableCell>{court.maxPlayers}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}