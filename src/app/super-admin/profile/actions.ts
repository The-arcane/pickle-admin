'use server';

import { createServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function updateSuperAdminProfile(formData: FormData) {
  const supabase = await createServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/super-admin/login');
  }

  const name = formData.get('fullName') as string;
  const phone = formData.get('phone') as string;

  const { error } = await supabase
    .from('user')
    .update({ name, phone })
    .eq('user_uuid', user.id);

  if (error) {
    console.error('Error updating profile:', error);
    // Redirecting with an error could be an option, but for now we'll just log
    // and revalidate.
  }

  revalidatePath('/super-admin/profile');
  revalidatePath('/super-admin/layout'); // To update the UserNav potentially
}
