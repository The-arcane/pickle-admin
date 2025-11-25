
'use server';

import { createServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const supabase = await createServer();

    const { data: { user }, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error || !user) {
        return redirect(`/?error=${encodeURIComponent(error?.message || 'Invalid login credentials.')}`);
    }

    const { data: userProfile, error: profileError } = await supabase
        .from('user')
        .select('id, user_type')
        .eq('user_uuid', user.id)
        .single();
    
    if (profileError || !userProfile) {
        await supabase.auth.signOut();
        return redirect(`/?error=${encodeURIComponent('Could not retrieve user profile. Please contact an administrator.')}`);
    }

    const { id: userId, user_type } = userProfile;
    
    // Determine the redirect path based on user_type
    let redirectPath = '/';
    switch (user_type) {
        case 2: redirectPath = '/livingspace'; break;
        case 3: redirectPath = '/super-admin/dashboard'; break;
        case 4: redirectPath = '/employee/dashboard'; break;
        case 6: redirectPath = '/sales/dashboard'; break;
        case 7: redirectPath = '/education/dashboard'; break;
        case 8: redirectPath = '/hospitality/dashboard'; break;
        case 9: redirectPath = '/arena/dashboard'; break;
        default:
             await supabase.auth.signOut();
             return redirect(`/?error=${encodeURIComponent('Invalid user role.')}`);
    }

    // Revalidate the path to ensure the client-side cache is updated,
    // then perform the redirect. This helps prevent redirect loops.
    revalidatePath('/', 'layout');
    redirect(redirectPath);
}
