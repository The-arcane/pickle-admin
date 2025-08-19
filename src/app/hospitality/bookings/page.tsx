
import { createServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { BookingsClientPage } from './client';

export default async function HospitalityBookingsPage() {
    const supabase = await createServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return redirect('/login?type=hospitality');
    }

    const { data: userProfile } = await supabase.from('user').select('id').eq('user_uuid', user.id).single();
    if (!userProfile) return <p>User profile not found.</p>;

    const { data: orgLink } = await supabase.from('user_organisations').select('organisation_id').eq('user_id', userProfile.id).single();
    if (!orgLink) return <p>You are not associated with an organization.</p>;
    
    const { data: bookings, error } = await supabase
        .from('package_bookings')
        .select(`
            *,
            package:package_id ( title ),
            user:user_id ( name, email, profile_image_url )
        `)
        .eq('organisation_id', orgLink.organisation_id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching package bookings:", error);
    }
    
    return (
        <div className="space-y-6">
            <BookingsClientPage bookings={bookings || []} />
        </div>
    );
}
