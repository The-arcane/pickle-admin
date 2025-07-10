
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
  
  // After successful login, check user_type
  if(user) {
    const { data: userProfile, error: profileError } = await supabase
        .from('user')
        .select('user_type')
        .eq('user_uuid', user.id)
        .single();
    
    if(profileError || !userProfile || userProfile.user_type !== 2) {
        await supabase.auth.signOut();
        return redirect(`/login?error=${encodeURIComponent('Access denied. Not an admin.')}&type=admin`);
    }
  } else {
    // This case should ideally not be hit if there's no error, but as a safeguard:
    return redirect(`/login?error=${encodeURIComponent('An unexpected error occurred. Please try again.')}&type=admin`);
  }


  // On successful login, redirect to the dashboard.
  // The middleware will handle refreshing the session.
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
            await supabase.auth.signOut(); // Log out the user if they are not an employee
            return redirect(`/login?error=${encodeURIComponent('Access denied. Not an employee.')}&type=employee`);
        }
    } else {
        // This case should ideally not be hit if there's no error, but as a safeguard:
        return redirect(`/login?error=${encodeURIComponent('An unexpected error occurred. Please try again.')}&type=employee`);
    }
    
    // Redirect to the employee dashboard on success
    return redirect('/employee/dashboard');
}
