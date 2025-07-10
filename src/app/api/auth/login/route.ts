
import { createServer } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { email, password } = await request.json();
  const supabase = await createServer();

  // 1. Authenticate user
  const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !user) {
    return NextResponse.json({ error: authError?.message || 'Invalid credentials.' }, { status: 401 });
  }

  // 2. Fetch user profile to check user_type
  const { data: userProfile, error: profileError } = await supabase
    .from('user')
    .select('id, user_type')
    .eq('user_uuid', user.id)
    .single();

  if (profileError || !userProfile) {
    await supabase.auth.signOut();
    return NextResponse.json({ error: 'Could not retrieve user profile.' }, { status: 500 });
  }
  
  // 3. Check if user_type is Admin (2)
  if (userProfile.user_type !== 2) {
    await supabase.auth.signOut();
    return NextResponse.json({ error: 'Access Denied. You are not an authorized Admin.' }, { status: 403 });
  }

  // 4. Check if admin is associated with an organization
  const { data: orgLink, error: orgLinkError } = await supabase
    .from('user_organisations')
    .select('organisation_id')
    .eq('user_id', userProfile.id)
    .maybeSingle();
  
  if (orgLinkError || !orgLink) {
    await supabase.auth.signOut();
    return NextResponse.json({ error: 'Admin profile is not correctly associated with any organization.' }, { status: 403 });
  }
  
  // All checks passed
  return NextResponse.json({ success: true, message: "Login successful" });
}
