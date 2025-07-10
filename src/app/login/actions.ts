
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
  
  if (user) {
    const { data: userProfile, error: profileError } = await supabase
        .from('user')
        .select('user_type')
        .eq('user_uuid', user.id)
        .single();
    
    if (profileError || !userProfile || userProfile.user_type !== 2) {
        await supabase.auth.signOut();
        return redirect(`/login?error=${encodeURIComponent('Access Denied. You are not an authorized Admin.')}`);
    }

    return redirect('/dashboard');
  }

  // Fallback for any other unexpected case.
  return redirect(`/login?error=${encodeURIComponent('An unexpected error occurred. Please try again.')}`);
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

    if (user) {
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
    
    return redirect(`/login?type=employee&error=${encodeURIComponent('An unexpected error occurred. Please try again.')}`);
}
