'use server';

import { createServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function signup(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const fullName = formData.get('fullName') as string;
  const supabase = createServer();

  if (!email || !password || !fullName) {
    return redirect('/signup?error=Please fill all fields.');
  }

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: fullName,
      },
    },
  });

  if (authError) {
    console.error('Signup Auth Error:', authError.message);
    return redirect(`/signup?error=${encodeURIComponent(authError.message)}`);
  }

  if (authData.user) {
    const { error: profileError } = await supabase.from('user').insert({
      user_uuid: authData.user.id,
      name: fullName,
      email: email,
      user_type: 1, // 1 for regular user
    });

    if (profileError) {
        console.error('Signup Profile Error:', profileError);
        return redirect(`/signup?error=${encodeURIComponent('Could not create user profile. Try signing in.')}`);
    }
  } else {
    return redirect('/signup?error=An unexpected error occurred during signup.');
  }

  return redirect('/signup/confirm');
}
