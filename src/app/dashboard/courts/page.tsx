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
import { createServer } from '@/lib/supabase/server';

export default async function CourtListPage() {
  const supabase = createServer();

  // Call the stored procedure instead of using a raw query string
  const { data, error } = await supabase.rpc('get_available_courts', {
    target_date: '2025-07-05',
    start_time_check: '10:30',
    end_time_check: '12:00',
  });

  if (error) {
    console.error('Error fetching courts:', error);
  }

  const courts = data || [];

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
              {courts.map((court) => (
                <TableRow key={court.id}>
                  <TableCell className="font-medium">{court.name}</TableCell>
                  <TableCell>{court.venue || 'N/A'}</TableCell>
                  <TableCell>{court.type || 'N/A'}</TableCell>
                  <TableCell>{court.max_players || 'N/A'}</TableCell>
                </TableRow>
              ))}
              {courts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No available courts found for the selected criteria.
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
