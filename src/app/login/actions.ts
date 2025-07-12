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
        return redirect(`${loginUrl}&error=${encodeURIComponent(error?.message || 'Authentication failed.')}`);
    }

    const { data: userProfile, error: profileError } = await supabase
        .from('user')
        .select('user_type')
        .eq('user_uuid', user.id)
        .single();
    
    if (profileError || !userProfile) {
        await supabase.auth.signOut();
        return redirect(`${loginUrl}&error=${encodeURIComponent('Could not retrieve user profile.')}`);
    }

    const { user_type } = userProfile;

    // Check if the user's role matches the login form they used
    switch (userTypeTarget) {
        case 'super-admin':
            if (user_type !== 3) {
                await supabase.auth.signOut();
                return redirect(`/login?type=super-admin&error=${encodeURIComponent('Access Denied. You are not a Super Admin.')}`);
            }
            return redirect('/super-admin/dashboard');
        case 'admin':
             if (user_type !== 2) {
                await supabase.auth.signOut();
                return redirect(`/login?error=${encodeURIComponent('Access Denied. You are not an authorized Admin.')}`);
            }
            return redirect('/dashboard');
        case 'employee':
            if (user_type !== 4) {
                await supabase.auth.signOut();
                return redirect(`/login?type=employee&error=${encodeURIComponent('Access Denied. You are not an authorized Employee.')}`);
            }
            return redirect('/employee/dashboard');
        default:
             await supabase.auth.signOut();
             return redirect(`/login?error=${encodeURIComponent('Invalid login attempt.')}`);
    }
}
