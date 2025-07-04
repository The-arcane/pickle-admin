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

  const rawQuery = `
    SELECT
      c.name,
      c.id,
      org.name as venue,
      s.name as type,
      s.max_players
    FROM
      public.courts c
    LEFT JOIN
      public.organisations org ON c.organisation_id = org.id
    LEFT JOIN
      public.sports s ON c.sport_id = s.id
    WHERE c.id NOT IN (
        -- Specific availability blocks
        SELECT ab.court_id
        FROM public.availability_blocks ab
        WHERE ab.date = '2025-07-05'
          AND (
                (ab.start_time IS NULL AND ab.end_time IS NULL) OR
                (ab.start_time < '12:00' AND ab.end_time > '10:30')
          )
    )
    AND c.id NOT IN (
        -- Bookings that overlap the requested time
        SELECT b.court_id
        FROM public.bookings b
        JOIN public.timeslots t ON b.timeslot_id = t.id
        WHERE b.status IN (1, 2)  -- Pending or Confirmed
          AND t.date = '2025-07-05'
          AND t.start_time::time < '12:00'
          AND t.end_time::time > '10:30'
    )
  `;

  const { data, error } = await supabase.sql(rawQuery);

  if (error) {
    console.error('Error fetching courts:', error);
  }

  const courts =
    data?.map((court: any) => ({
      name: court.name,
      venue: court.venue || 'N/A',
      type: court.type || 'N/A',
      maxPlayers: court.max_players || 'N/A',
    })) || [];

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
