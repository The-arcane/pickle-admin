
'use server';

import { createServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function superAdminLogin(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const supabase = await createServer();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return redirect(`/super-admin/login?error=${encodeURIComponent(error?.message || 'Invalid credentials')}`);
  }
  
  const { data: userProfile, error: profileError } = await supabase
    .from('user')
    .select('user_type')
    .eq('user_uuid', data.user.id)
    .single();

  // Assuming user_type 3 is for Super Admin
  if (profileError || !userProfile || userProfile.user_type !== 3) {
      await supabase.auth.signOut(); // Sign out the user if they are not a super admin
      return redirect(`/super-admin/login?error=${encodeURIComponent('Access Denied. You are not a Super Admin.')}`);
  }

  // On successful login and verification, redirect to the super admin dashboard.
  return redirect('/super-admin/dashboard');
}
