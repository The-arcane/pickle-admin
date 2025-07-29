
'use server';

import { createServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function saveChannel(formData: FormData) {
    const supabase = await createServer();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: 'You must be logged in to manage channels.' };
    }

    const { data: userProfile } = await supabase.from('user').select('id, user_organisations(organisation_id)').eq('user_uuid', user.id).single();
    if (!userProfile) {
        return { error: 'Could not retrieve your user profile.' };
    }

    const organisationId = userProfile.user_organisations[0]?.organisation_id;
    if (!organisationId) {
        return { error: 'You are not associated with any organization.' };
    }

    const id = formData.get('id') as string | null;
    const channelData = {
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        type: formData.get('type') as string,
        visibility: formData.get('visibility') as 'public' | 'private'
    };

    if (id) {
        // Update existing channel
        const { error } = await supabase
            .from('realtime_channels')
            .update(channelData)
            .eq('id', id)
            .eq('owner_org_id', organisationId);

        if (error) {
            console.error('Error updating channel:', error);
            return { error: `Failed to update channel: ${error.message}` };
        }
    } else {
        // Create new channel
        const { error } = await supabase
            .from('realtime_channels')
            .insert({
                ...channelData,
                owner_org_id: organisationId,
                created_by: userProfile.id
            });
        
        if (error) {
            console.error('Error creating channel:', error);
            return { error: `Failed to create channel: ${error.message}` };
        }
    }

    revalidatePath('/dashboard/channels');
    redirect('/dashboard/channels');
}

export async function deleteChannel(formData: FormData) {
    const supabase = await createServer();
    const id = formData.get('id') as string;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };
    
    const { data: userProfile } = await supabase.from('user').select('user_organisations(organisation_id)').eq('user_uuid', user.id).single();
    const organisationId = userProfile?.user_organisations[0]?.organisation_id;

    if (!organisationId) return { error: 'Not part of an organization' };
    
    if (!id) {
        return { error: 'Channel ID is missing.' };
    }

    const { error } = await supabase
        .from('realtime_channels')
        .delete()
        .eq('id', id)
        .eq('owner_org_id', organisationId);

    if (error) {
        console.error('Error deleting channel:', error);
        return { error: `Failed to delete channel: ${error.message}` };
    }

    revalidatePath('/dashboard/channels');
    redirect('/dashboard/channels');
}

export async function inviteMembers(channelId: string, userIds: number[]) {
    const supabase = await createServer();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const { data: userProfile } = await supabase.from('user').select('id').eq('user_uuid', user.id).single();
    if (!userProfile) return { error: 'Could not find your profile.' };

    const invitations = userIds.map(userId => ({
        channel_id: channelId,
        invited_user_id: userId,
        invited_by_user_id: userProfile.id,
    }));

    const { error } = await supabase.from('channel_invitations').insert(invitations);
    if(error) {
        console.error("Error inviting members:", error);
        return { error: 'Could not invite members to the channel.' };
    }

    revalidatePath(`/dashboard/channels/${channelId}`);
    return { success: true };
}


export async function removeMember(invitationId: number) {
    const supabase = await createServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const { error } = await supabase.from('channel_invitations').delete().eq('id', invitationId);

    if (error) {
        console.error("Error removing member:", error);
        return { error: 'Could not remove member from channel.' };
    }
    
    revalidatePath('/dashboard/channels');
    return { success: true };
}
