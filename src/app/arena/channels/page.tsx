
import { createServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ChannelsClientPage } from '@/app/livingspace/channels/client';
import { Radio } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ArenaChannelsPage() {
    const supabase = await createServer();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return redirect('/login?type=arena');
    }

    const { data: userRecord } = await supabase
        .from('user')
        .select('id')
        .eq('user_uuid', user.id)
        .single();
    
    if (!userRecord) {
        return redirect('/login?type=arena');
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
                <p className="text-muted-foreground">You are not associated with an arena.</p>
            </div>
        );
    }
    
    const { data: channelsData, error } = await supabase
        .from('realtime_channels')
        .select(`
            id,
            name,
            description,
            visibility,
            type,
            created_at,
            created_by:user!realtime_channels_created_by_fkey ( name, profile_image_url )
        `)
        .eq('owner_org_id', organisationId)
        .order('created_at', { ascending: false });
    
    if (error) {
        console.error("Error fetching channels:", error);
    }

    return (
      <div className="space-y-6">
          <div className="flex items-center gap-3">
              <Radio className="h-8 w-8 text-indigo-500" />
              <div>
                  <h1 className="text-3xl font-bold">Channels</h1>
                  <p className="text-muted-foreground">Manage real-time communication channels for your arena.</p>
              </div>
          </div>
          <ChannelsClientPage initialChannels={channelsData || []} />
      </div>
    );
}
