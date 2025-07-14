
import { createServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AdminsClientPage } from './client';

export default async function AdminsPage() {
  const supabase = await createServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/login?type=super-admin');
  }

  // Fetch all users who are admins
  const { data: adminsData, error: adminsError } = await supabase
    .from('user')
    .select(`
        id, name, email, phone, profile_image_url, is_deleted, created_at,
        organisations:user_organisations(
            organisation_id,
            organisations(name)
        )
    `)
    .eq('user_type', 2);

  if (adminsError) {
    console.error('Error fetching admins:', adminsError);
  }

  const admins = adminsData?.map(admin => ({
      ...admin,
      // An admin might not be linked to an org yet, so we safely access the name
      organisationName: admin.organisations[0]?.organisations?.name || 'Unassigned'
  })) || [];


  return <AdminsClientPage admins={admins} />;
}
