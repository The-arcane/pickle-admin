
import { Suspense } from 'react';
import { SuperAdminLoginForm } from './client';
import { createServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function SuperAdminLoginPage() {
    const supabase = await createServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        const { data: userProfile } = await supabase
            .from('user')
            .select('user_type')
            .eq('user_uuid', user.id)
            .single();
        
        if (userProfile?.user_type === 3) {
            return redirect('/super-admin/dashboard');
        }
    }

    return (
        <Suspense>
            <SuperAdminLoginForm />
        </Suspense>
    );
}
