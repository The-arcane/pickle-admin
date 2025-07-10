
'use server';

import { createServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function login(formData: FormData): Promise<any> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const supabase = createServer();

  // 1. Authenticate user
  const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !user) {
    const errorMessage = authError?.message || 'Authentication failed. Please check your credentials.';
    return { success: false, step: '1 - Authentication', error: errorMessage };
  }

  // 2. Fetch user profile
  const { data: userProfile, error: profileError } = await supabase
    .from('user')
    .select('id, user_type')
    .eq('user_uuid', user.id)
    .single();

  if (profileError || !userProfile) {
    await supabase.auth.signOut();
    return { success: false, step: '2 - Profile Fetch', error: profileError?.message || 'Could not retrieve user profile.' };
  }
  
  // 3. Check user type
  if (userProfile.user_type !== 2) {
    await supabase.auth.signOut();
    return { success: false, step: '3 - User Type Check', error: 'Access Denied. You are not an authorized Admin.', profile: userProfile };
  }

  // 4. Check for organization link
  const { data: orgLink, error: orgLinkError } = await supabase
    .from('user_organisations')
    .select('organisation_id')
    .eq('user_id', userProfile.id)
    .maybeSingle();

  if (orgLinkError) {
      await supabase.auth.signOut();
      return { success: false, step: '4 - Org Link Fetch', error: orgLinkError.message };
  }
  
  if (!orgLink?.organisation_id) {
    await supabase.auth.signOut();
    return { success: false, step: '4 - Org Link Check', error: 'Admin profile is not correctly associated with any organization.', orgLink: orgLink };
  }
  
  // If all checks pass, return success
  return { success: true, step: '5 - Success', message: 'All checks passed. Ready for redirect.' };
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


