import { createServer } from '@/lib/supabase/server';
import { CourtsClientPage } from './client';

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

  return <CourtsClientPage courts={courts} />;
}
