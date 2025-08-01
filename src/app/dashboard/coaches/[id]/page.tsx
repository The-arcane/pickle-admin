
import { createServer } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { EditCoachClientPage } from './client';
import type { Coach, User } from './types';

export default async function EditCoachPage({ params }: { params: { id: string } }) {
    const supabase = await createServer();
    const { id } = params;
    const isAdding = id === 'add';

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return redirect('/login');
    }

    const { data: userRecord } = await supabase
        .from('user')
        .select('id, organisation_id')
        .eq('user_uuid', user.id)
        .single();
    
    if (!userRecord) {
        return redirect('/login');
    }
    
    const organisationId = userRecord?.organisation_id;

    if (!organisationId) {
        return <p>You are not associated with an organization.</p>;
    }

    let coach: Coach | null = null;
    if (!isAdding) {
        const { data: coachData, error } = await supabase
            .from('coaches')
            .select(`
                *,
                user:user_id(*),
                coach_sports:coach_sports!left(sport_id),
                coach_pricing:coach_pricing!left(*)
            `)
            .eq('id', id)
            .single();

        if (error || !coachData) {
            console.error("Error fetching coach:", error);
            notFound();
        }
        coach = coachData as Coach;
    }

    // Fetch potential users to be assigned as coaches (from the same org)
    const { data: orgUsersData, error: usersError } = await supabase
      .from('user')
      .select('id, name')
      .eq('organisation_id', organisationId)

    const usersForCoachAssignment = orgUsersData as User[] || [];

    const { data: sportsData, error: sportsError } = await supabase.from('sports').select('id, name');

    if (usersError || sportsError) {
        console.error("Error fetching related data:", { usersError, sportsError });
    }

    return (
        <EditCoachClientPage
            coach={coach}
            users={usersForCoachAssignment}
            sports={sportsData || []}
            organisationId={organisationId}
        />
    );
}
