
import { createServer } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { EditSessionClientPage } from './client';

type Coach = {
    id: number;
    name: string | null;
}

export default async function EditAttendanceSessionPage({ params }: { params: { id: string } }) {
  const supabase = await createServer();
  const { id } = params;
  const isAdding = id === 'add';

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/login?type=education');
  }

  const { data: userProfile } = await supabase.from('user').select('id, user_organisations(organisation_id)').eq('user_uuid', user.id).single();
  const organisationId = userProfile?.user_organisations[0]?.organisation_id;

  if (!organisationId) {
      return <p>You are not associated with any organization.</p>;
  }

  let session = null;
  if (!isAdding) {
      const { data, error } = await supabase
        .from('attendance_sessions')
        .select('*')
        .eq('id', id)
        .eq('organisation_id', organisationId)
        .single();
    
      if (error || !data) {
          console.error('Error fetching session or session not found:', error);
          notFound();
      }
      session = data;
  }
  
  // Fetch coaches from the same organization to populate the dropdown
  const { data: coaches, error: coachesError } = await supabase
    .from('user_organisations')
    .select('user!inner(id, name)')
    .eq('organisation_id', organisationId)
    .eq('user.user_type', 5); // 5 is the user_type for 'Coach'

  if (coachesError) {
      console.error('Error fetching coaches:', coachesError);
  }

  const coachList: Coach[] = coaches?.map(c => c.user).filter(Boolean) as Coach[] || [];

  return (
    <EditSessionClientPage 
        session={session}
        coaches={coachList}
    />
  );
}
