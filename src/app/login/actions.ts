
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
    return { success: false, error: error.message };
  }
  
  if (user) {
    const { data: userProfile, error: profileError } = await supabase
        .from('user')
        .select('user_type')
        .eq('user_uuid', user.id)
        .single();
    
    if (profileError || !userProfile || userProfile.user_type !== 2) {
        await supabase.auth.signOut();
        return { success: false, error: 'Access Denied. You are not an authorized Admin.' };
    }

    // On successful login and profile check, return success.
    return { success: true };
  }

  // Fallback for any other unexpected case.
  return { success: false, error: 'An unexpected error occurred. Please try again.' };
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
        return { success: false, error: error.message };
    }

    if (user) {
        const { data: userProfile, error: profileError } = await supabase
            .from('user')
            .select('user_type')
            .eq('user_uuid', user.id)
            .single();

        if (profileError || !userProfile || userProfile.user_type !== 4) {
            await supabase.auth.signOut(); 
            return { success: false, error: 'Access Denied. You are not an authorized Employee.' };
        }
        
        return { success: true };
    }
    
    // Fallback for any other unexpected case.
    return { success: false, error: 'An unexpected error occurred. Please try again.'};
}
