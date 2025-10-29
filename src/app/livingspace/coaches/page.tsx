
import { createServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { CoachesClientPage } from './client';

export const dynamic = 'force-dynamic';

export default async function CoachesPage() {
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
                <p className="text-muted-foreground">You are not associated with a Living Space.</p>
            </div>
        );
    }
    
    const { data: coachesData, error } = await supabase
        .from('coaches')
        .select(`
            id,
            bio,
            profile_image,
            rating,
            user:user_id ( name ),
            sports:coach_sports ( sport:sports ( name ) )
        `)
        .eq('organisation_id', organisationId)
        .order('id');
    
    if (error) {
        console.error("Error fetching coaches:", error);
    }

    const coaches = coachesData?.map(coach => ({
        id: coach.id,
        name: coach.user?.name ?? 'N/A',
        bio: coach.bio,
        profile_image: coach.profile_image,
        rating: coach.rating,
        sports: coach.sports.map(s => s.sport?.name).filter(Boolean).join(', ')
    })) || [];
    
    return <CoachesClientPage initialCoaches={coaches} />;
}
