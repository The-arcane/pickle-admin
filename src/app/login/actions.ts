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
    
    const loginUrl = userTypeTarget === 'employee' ? '/login?type=employee' : (userTypeTarget === 'super-admin' ? '/login?type=super-admin' : '/login');

    if (error || !user) {
        // This is the only place where credentials are truly invalid.
        return redirect(`${loginUrl}&error=${encodeURIComponent(error?.message || 'Invalid login credentials.')}`);
    }

    const { data: userProfile, error: profileError } = await supabase
        .from('user')
        .select('user_type')
        .eq('user_uuid', user.id)
        .single();
    
    if (profileError || !userProfile) {
        await supabase.auth.signOut();
        // This error means the user exists in auth.users but not in our public.user table.
        return redirect(`${loginUrl}&error=${encodeURIComponent('Could not retrieve user profile. Please contact an administrator.')}`);
    }

    const { user_type } = userProfile;

    // Check if the user's role matches the login form they used
    switch (userTypeTarget) {
        case 'super-admin':
            if (user_type !== 3) {
                await supabase.auth.signOut();
                return redirect(`/login?type=super-admin&error=${encodeURIComponent('Access Denied. You are not registered as a Super Admin.')}`);
            }
            return redirect('/super-admin/dashboard');
        case 'admin':
             if (user_type !== 2) {
                await supabase.auth.signOut();
                return redirect(`/login?error=${encodeURIComponent('Access Denied. You are not registered as an Admin.')}`);
            }
            return redirect('/dashboard');
        case 'employee':
            if (user_type !== 4) {
                await supabase.auth.signOut();
                return redirect(`/login?type=employee&error=${encodeURIComponent('Access Denied. You are not registered as an Employee.')}`);
            }
            return redirect('/employee/dashboard');
        default:
             await supabase.auth.signOut();
             return redirect(`/login?error=${encodeURIComponent('Invalid login attempt.')}`);
    }
}
