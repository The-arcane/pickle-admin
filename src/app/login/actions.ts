
'use server';

import { createServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const userTypeTarget = formData.get('userType') as 'admin' | 'super-admin' | 'employee' | 'sales' | 'education';
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
    } else if (userTypeTarget === 'sales') {
        loginUrl = '/login?type=sales';
    } else if (userTypeTarget === 'education') {
        loginUrl = '/login?type=education';
    }


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
    
    const { data: orgLink } = await supabase
        .from('user_organisations')
        .select('organisation_id')
        .eq('user_id', userId)
        .maybeSingle();

    const organisationId = orgLink?.organisation_id;

    // Check if the user's role matches the login form they used and redirect
    switch (user_type) {
        case 2: // Admin
            if (userTypeTarget !== 'admin') {
                await supabase.auth.signOut();
                return redirect(`${loginUrl}?error=${encodeURIComponent('Access Denied. Please use the Admin login form.')}`);
            }
            if (!organisationId) {
                 await supabase.auth.signOut();
                 return redirect(`/login?error=${encodeURIComponent('Your account is not associated with an organization.')}`);
            }
            return redirect('/dashboard');
        case 3: // Super Admin
             if (userTypeTarget !== 'super-admin') {
                await supabase.auth.signOut();
                return redirect(`${loginUrl}?error=${encodeURIComponent('Access Denied. Please use the Super Admin login form.')}`);
            }
            return redirect('/super-admin/dashboard');
        case 4: // Employee
             if (userTypeTarget !== 'employee') {
                await supabase.auth.signOut();
                return redirect(`${loginUrl}?error=${encodeURIComponent('Access Denied. Please use the Employee login form.')}`);
            }
             if (!organisationId) {
                 await supabase.auth.signOut();
                 return redirect(`/login?type=employee&error=${encodeURIComponent('Employee profile is not associated with any organization.')}`);
            }
            return redirect('/employee/dashboard');
        case 6: // Sales People
             if (userTypeTarget !== 'sales') {
                await supabase.auth.signOut();
                return redirect(`${loginUrl}?error=${encodeURIComponent('Access Denied. Please use the Sales login form.')}`);
            }
            return redirect('/sales/dashboard');
        case 7: // Education
             if (userTypeTarget !== 'education') {
                await supabase.auth.signOut();
                return redirect(`${loginUrl}?error=${encodeURIComponent('Access Denied. Please use the Education login form.')}`);
            }
            return redirect('/education/dashboard');
        default:
             await supabase.auth.signOut();
             return redirect(`${loginUrl}?error=${encodeURIComponent('Invalid user role.')}`);
    }
}
