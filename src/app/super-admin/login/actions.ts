'use server';

import { createServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function superAdminLogin(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const supabase = createServer();

  const { data: { user }, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return redirect(`/super-admin/login?error=${encodeURIComponent(error.message)}`);
  }

  if (user) {
    const { data: userProfile, error: profileError } = await supabase
        .from('user')
        .select('user_type')
        .eq('user_uuid', user.id)
        .single();
    
    // Assuming user_type 3 is for Super Admin
    if (profileError || !userProfile || userProfile.user_type !== 3) {
        await supabase.auth.signOut();
        return redirect(`/super-admin/login?error=${encodeURIComponent('Access Denied. Not a Super Admin.')}`);
    }
  }

  // On successful login, redirect to the super admin dashboard.
  return redirect('/super-admin/dashboard');
}
