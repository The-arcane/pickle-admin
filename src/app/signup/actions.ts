
'use server';

import { createServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function signup(formData: FormData) {
  const supabase = createServer();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const name = formData.get('name') as string;
  const organisation_id = Number(formData.get('organisation_id'));
  const building_number_id = formData.get('building_number_id') ? Number(formData.get('building_number_id')) : null;
  const flat = formData.get('flat') as string | null;

  const {
    data: { user: authUser },
    error: signupError,
  } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        user_type: 1, // Resident User Type
      },
    },
  });

  if (signupError) {
    console.error('Signup Error:', signupError);
    return redirect(`/signup?error=${encodeURIComponent(signupError.message)}`);
  }
  if (!authUser) {
    return redirect(`/signup?error=${encodeURIComponent('Could not create user.')}`);
  }

  // The public.user row is created by a trigger.
  // We need to fetch it to get the user's integer ID for the approvals table.
  const { data: userRow, error: userError } = await supabase
    .from("user")
    .select("id, organisation_id")
    .eq("user_uuid", authUser.id)
    .single();

  if (userError || !userRow) {
    console.error("Could not fetch user profile after signup:", userError);
    // Best effort, proceed without creating approval if this fails.
    // The user can still be manually approved.
    return redirect('/signup/confirm');
  }

  // Create the permanent approval request record
  const { error: approvalError } = await supabase
    .from("approvals")
    .insert({
      user_id: userRow.id,
      organisation_id: organisation_id,
      building_number_id: building_number_id,
      flat: flat,
      is_approved: false
    });
  
  if (approvalError) {
      console.error("Error creating approval request:", approvalError);
      // Don't block the user, just log the error. The admin can manually approve.
  }


  revalidatePath('/livingspace/approvals');
  return redirect('/signup/confirm');
}
