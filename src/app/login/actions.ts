
'use server';

import { createServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

// Admin login is now handled by /api/auth/login
// This file is kept for the employee login server action.

export async function employeeLogin(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const supabase = createServer();

    const { data: { user }, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error || !user) {
        return redirect(`/login?type=employee&error=${encodeURIComponent(error?.message || 'Authentication failed.')}`);
    }

    const { data: userProfile, error: profileError } = await supabase
        .from('user')
        .select('user_type')
        .eq('user_uuid', user.id)
        .single();
        
    if (userProfile.user_type !== 4) { // 4 is Employee
        await supabase.auth.signOut(); 
        return redirect(`/login?type=employee&error=${encodeURIComponent('Access Denied. You are not an authorized Employee.')}`);
    }
    
    return redirect('/employee/dashboard');
}
