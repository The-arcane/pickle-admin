
import { createServer } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { EditChannelClientPage } from './client';
import type { Channel } from '@/app/livingspace/channels/[id]/types';

export default async function ArenaEditChannelPage({ params }: { params: { id: string } }) {
    const supabase = await createServer();
    const { id } = params;
    const isAdding = id === 'add';

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return redirect('/login?type=arena');
    }
    
    const { data: userProfile } = await supabase.from('user').select('id, user_organisations(organisation_id)').eq('user_uuid', user.id).single();
    if (!userProfile) {
        return notFound();
    }
    const organisationId = userProfile.user_organisations[0]?.organisation_id;
    if (!organisationId) {
        return <p>You are not associated with any organization.</p>;
    }


    let channel: Channel | null = null;
    let members = [];
    let usersInOrg = [];

    if (!isAdding) {
        const { data: channelData, error } = await supabase
            .from('realtime_channels')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !channelData) {
            console.error("Error fetching channel:", error);
            notFound();
        }
        channel = channelData as Channel;

        const { data: memberData, error: memberError } = await supabase
            .from('channel_invitations')
            .select('*, user:invited_user_id(id, name, email, profile_image_url)')
            .eq('channel_id', id);
        
        if(memberError) console.error("Error fetching members:", memberError);
        else members = memberData;
        
    }
    
    const { data: orgUsers, error: orgUsersError } = await supabase
        .from('user_organisations')
        .select('user!inner(id, name, email, profile_image_url)')
        .eq('organisation_id', organisationId);
    
    if (orgUsersError) console.error("Error fetching org users:", orgUsersError);
    else usersInOrg = orgUsers.map(u => u.user).filter(Boolean);

    return (
        <EditChannelClientPage
            channel={channel}
            members={members}
            users={usersInOrg}
        />
    );
}
