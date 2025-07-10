
'use server';

import { createServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function login(formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServer();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !user) {
      return { success: false, error: authError?.message || 'Invalid credentials.' };
    }

    // 2. Fetch user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('user')
      .select('id, user_type')
      .eq('user_uuid', user.id)
      .single();

    if (profileError || !userProfile) {
      await supabase.auth.signOut();
      return { success: false, error: 'Could not retrieve user profile.' };
    }
    
    // 3. Check user type
    if (userProfile.user_type !== 2) {
      await supabase.auth.signOut();
      return { success: false, error: 'Access Denied. You are not an authorized Admin.' };
    }

    // 4. Check for organization link
    const { data: orgLink, error: orgLinkError } = await supabase
      .from('user_organisations')
      .select('organisation_id')
      .eq('user_id', userProfile.id)
      .maybeSingle();

    if (orgLinkError || !orgLink) {
        await supabase.auth.signOut();
        return { success: false, error: 'Admin profile is not correctly associated with any organization.' };
    }
    
    // If all checks pass, return success
    return { success: true };

  } catch (e: any) {
    // Catch any unexpected errors during the process
    return { success: false, error: `An unexpected server error occurred: ${e.message}` };
  }
}

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

    if (profileError || !userProfile) {
        await supabase.auth.signOut();
        return redirect(`/login?type=employee&error=${encodeURIComponent('Could not retrieve user profile.')}`);
    }
        
    if (userProfile.user_type !== 4) { // 4 is Employee
        await supabase.auth.signOut(); 
        return redirect(`/login?type=employee&error=${encodeURIComponent('Access Denied. You are not an authorized Employee.')}`);
    }
    
    return redirect('/employee/dashboard');
}
