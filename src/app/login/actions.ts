
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
    return redirect(`/login?error=${encodeURIComponent(error.message)}&type=admin`);
  }
  
  if (user) {
    const { data: userProfile, error: profileError } = await supabase
        .from('user')
        .select('user_type')
        .eq('user_uuid', user.id)
        .single();
    
    if (profileError || !userProfile || userProfile.user_type !== 2) {
        await supabase.auth.signOut();
        return redirect(`/login?error=${encodeURIComponent('Access Denied. You are not an authorized Admin.')}&type=admin`);
    }
  }

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
        return redirect(`/login?error=${encodeURIComponent(error.message)}&type=employee`);
    }

    if (user) {
        const { data: userProfile, error: profileError } = await supabase
            .from('user')
            .select('user_type')
            .eq('user_uuid', user.id)
            .single();

        if (profileError || !userProfile || userProfile.user_type !== 4) {
            await supabase.auth.signOut(); 
            return redirect(`/login?error=${encodeURIComponent('Access Denied. You are not an authorized Employee.')}&type=employee`);
        }
    }
    
    return redirect('/employee/dashboard');
}
