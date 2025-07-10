
'use server';

import { createServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const supabase = createServer();

  const { data: { user } , error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }
  
  if (!user) {
     return redirect(`/login?error=${encodeURIComponent('Authentication failed. Please try again.')}`);
  }

  // User is authenticated, now check their user_type
  const { data: userProfile, error: profileError } = await supabase
      .from('user')
      .select('user_type')
      .eq('user_uuid', user.id)
      .single();
  
  // If there's an error fetching the profile, or they aren't an admin (type 2)
  if (profileError || !userProfile || userProfile.user_type !== 2) {
      await supabase.auth.signOut();
      return redirect(`/login?error=${encodeURIComponent('Access Denied. You are not an authorized Admin.')}`);
  }

  // If we reach here, user is a valid admin
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

    if (error) {
        return redirect(`/login?type=employee&error=${encodeURIComponent(error.message)}`);
    }

    if (!user) {
        return redirect(`/login?type=employee&error=${encodeURIComponent('Authentication failed. Please try again.')}`);
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
