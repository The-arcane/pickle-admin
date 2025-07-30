
'use server';

import { createServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const userTypeTarget = formData.get('userType') as 'admin' | 'super-admin' | 'employee';
    const supabase = await createServer();

    const { data: { user }, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    
    let loginUrl = '/login';
    if (userTypeTarget === 'employee') {
        loginUrl = '/login?type=employee';
    } else if (userTypeTarget === 'super-admin') {
        loginUrl = '/login?type=super-admin';
    }

    if (error || !user) {
        return redirect(`${loginUrl}&error=${encodeURIComponent(error?.message || 'Invalid login credentials.')}`);
    }

    const { data: userProfile, error: profileError } = await supabase
        .from('user')
        .select('user_type, user_organisations(organisation_id)')
        .eq('user_uuid', user.id)
        .single();
    
    if (profileError || !userProfile) {
        await supabase.auth.signOut();
        return redirect(`${loginUrl}&error=${encodeURIComponent('Could not retrieve user profile. Please contact an administrator.')}`);
    }

    const { user_type, user_organisations } = userProfile;
    const organisationId = user_organisations[0]?.organisation_id;

    // Check if the user's role matches the login form they used and redirect
    switch (user_type) {
        case 2: // Admin
            if (userTypeTarget !== 'admin') {
                await supabase.auth.signOut();
                return redirect(`${loginUrl}&error=${encodeURIComponent('Access Denied. Please use the Admin login form.')}`);
            }
            if (!organisationId) {
                 await supabase.auth.signOut();
                 return redirect(`/login?error=${encodeURIComponent('Admin profile is not associated with any organization.')}`);
            }
            return redirect('/dashboard');
        case 3: // Super Admin
             if (userTypeTarget !== 'super-admin') {
                await supabase.auth.signOut();
                return redirect(`${loginUrl}&error=${encodeURIComponent('Access Denied. Please use the Super Admin login form.')}`);
            }
            return redirect('/super-admin/dashboard');
        case 4: // Employee
             if (userTypeTarget !== 'employee') {
                await supabase.auth.signOut();
                return redirect(`${loginUrl}&error=${encodeURIComponent('Access Denied. Please use the Employee login form.')}`);
            }
             if (!organisationId) {
                 await supabase.auth.signOut();
                 return redirect(`/login?type=employee&error=${encodeURIComponent('Employee profile is not associated with any organization.')}`);
            }
            return redirect('/employee/dashboard');
        default:
             await supabase.auth.signOut();
             return redirect(`${loginUrl}&error=${encodeURIComponent('Invalid user role.')}`);
    }
}
