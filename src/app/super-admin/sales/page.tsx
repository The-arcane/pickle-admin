
import { createServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { SalesClientPage } from './client';

export default async function SalesPage() {
  const supabase = await createServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/login?type=super-admin');
  }

  // Fetch all users who are sales people
  const { data: salesData, error: salesError } = await supabase
    .from('user')
    .select('id, name, email, phone, profile_image_url, is_deleted, created_at')
    .eq('user_type', 6);

  if (salesError) {
    console.error('Error fetching sales people:', salesError);
  }

  return <SalesClientPage salesPeople={salesData || []} />;
}
