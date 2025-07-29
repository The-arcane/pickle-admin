
import { createServer } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { EditChannelClientPage } from './client';
import type { Channel } from './types';

export default async function EditChannelPage({ params }: { params: { id: string } }) {
    const supabase = await createServer();
    const { id } = params;
    const isAdding = id === 'add';

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return redirect('/login');
    }

    let channel: Channel | null = null;
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
    }

    return (
        <EditChannelClientPage
            channel={channel}
        />
    );
}
