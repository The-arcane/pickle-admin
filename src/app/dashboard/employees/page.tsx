
import { createServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { EmployeesClientPage } from './client';

export default async function EmployeesPage() {
  const supabase = await createServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/login');
  }

  const { data: userRecord } = await supabase
    .from('user')
    .select('id')
    .eq('user_uuid', user.id)
    .single();

  if (!userRecord) {
    return redirect('/login');
  }
  
  const { data: orgLink } = await supabase
    .from('user_organisations')
    .select('organisation_id')
    .eq('user_id', userRecord.id)
    .maybeSingle();

  const organisationId = orgLink?.organisation_id;

  if (!organisationId) {
    return (
        <div className="flex flex-col items-center justify-center h-full">
            <p className="text-muted-foreground">You are not associated with an organization.</p>
        </div>
    );
  }

  const { data: employeesData, error: employeesError } = await supabase
    .from('user_organisations')
    .select('user!inner(id, name, email, phone, profile_image_url, is_deleted, created_at)')
    .eq('organisation_id', organisationId)
    .eq('user.user_type', 4); // user_type 4 for Employee

  if (employeesError) {
    console.error('Error fetching employees:', employeesError);
  }
  
  const employees = employeesData?.map(e => e.user).filter(Boolean) || [];

  return <EmployeesClientPage employees={employees} organisationId={organisationId} />;
}
