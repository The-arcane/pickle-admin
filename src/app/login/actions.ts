
'use server';

import { createServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const supabase = await createServer();

    const { data: { user }, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    
    const loginUrl = '/login';

    if (error || !user) {
        return redirect(`${loginUrl}?error=${encodeURIComponent(error?.message || 'Invalid login credentials.')}`);
    }

    const { data: userProfile, error: profileError } = await supabase
        .from('user')
        .select('id, user_type')
        .eq('user_uuid', user.id)
        .single();
    
    if (profileError || !userProfile) {
        await supabase.auth.signOut();
        return redirect(`${loginUrl}?error=${encodeURIComponent('Could not retrieve user profile. Please contact an administrator.')}`);
    }

    const { id: userId, user_type } = userProfile;
    
    // Check for organization link for admin and employee roles
    // Super Admins (3), Sales (6) are exempt from this check.
    if (user_type === 2 || user_type === 4 || user_type === 7) { 
        const { data: orgLink } = await supabase
            .from('user_organisations')
            .select('organisation_id')
            .eq('user_id', userId)
            .maybeSingle();

        if (!orgLink?.organisation_id) {
             await supabase.auth.signOut();
             return redirect(`${loginUrl}?error=${encodeURIComponent('Your account is not associated with an organization.')}`);
        }
        
        // For education users, verify the organization type
        if (user_type === 7) {
            const { data: orgType } = await supabase
                .from('organisations')
                .select('type')
                .eq('id', orgLink.organisation_id)
                .single();
            
            // Assuming '2' is the ID for 'education' in organisation_types
            if (orgType?.type !== 2) {
                 await supabase.auth.signOut();
                 return redirect(`${loginUrl}?error=${encodeURIComponent('Your organization is not configured for the Education panel.')}`);
            }
        }
    }

    // Redirect based on the verified user_type
    switch (user_type) {
        case 2: return redirect('/dashboard');
        case 3: return redirect('/super-admin/dashboard');
        case 4: return redirect('/employee/dashboard');
        case 6: return redirect('/sales/dashboard');
        case 7: return redirect('/education/dashboard');
        default:
             await supabase.auth.signOut();
             return redirect(`${loginUrl}?error=${encodeURIComponent('Invalid user role.')}`);
    }
}
