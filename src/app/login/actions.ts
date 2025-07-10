
'use server';

import { createServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const supabase = createServer();

  const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !user) {
    return redirect(`/login?error=${encodeURIComponent(authError?.message || 'Authentication failed.')}`);
  }

  // Check 1: Verify the user's profile and type
  const { data: userProfile, error: profileError } = await supabase
    .from('user')
    .select('id, user_type')
    .eq('user_uuid', user.id)
    .single();

  if (profileError || !userProfile) {
    await supabase.auth.signOut();
    return redirect(`/login?error=${encodeURIComponent('Could not retrieve user profile.')}`);
  }

  if (userProfile.user_type !== 2) {
    await supabase.auth.signOut();
    return redirect(`/login?error=${encodeURIComponent('Access Denied. You are not an authorized Admin.')}`);
  }

  // Check 2: Verify the user owns an organization
  const { data: org, error: orgError } = await supabase
    .from('user_organisations')
    .select('organisation_id')
    .eq('user_id', userProfile.id)
    .limit(1)
    .maybeSingle();

  if (orgError || !org) {
    await supabase.auth.signOut();
    return redirect(`/login?error=${encodeURIComponent('Access Denied. Admin profile is not associated with any organization.')}`);
  }

  // If all checks pass, redirect to the dashboard
  return redirect('/dashboard');
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

    if (profileError || !userProfile || userProfile.user_type !== 4) {
        await supabase.auth.signOut(); 
        return redirect(`/login?type=employee&error=${encodeURIComponent('Access Denied. You are not an authorized Employee.')}`);
    }
    
    return redirect('/employee/dashboard');
}
