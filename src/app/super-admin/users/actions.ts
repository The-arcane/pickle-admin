'use server';

import { createServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateUser(formData: FormData) {
  const supabase = createServer();
  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const status = formData.get('status') as string;

  if (!id) {
    return { error: 'User ID is missing.' };
  }

  const { error } = await supabase
    .from('user')
    .update({
      name,
      email,
      phone,
      is_deleted: status === 'Inactive',
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating user:', error);
    return { error: 'Failed to update user.' };
  }

  revalidatePath('/super-admin/users');
  return { success: true };
}
