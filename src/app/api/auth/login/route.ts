
import { createServer } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const supabase = await createServer();

    // 1. Authenticate user's credentials
    const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !user) {
      console.error('Authentication failed:', authError?.message);
      return NextResponse.json({ error: authError?.message || 'Invalid credentials.' }, { status: 401 });
    }

    // 2. Fetch user profile to check user_type
    const { data: userProfile, error: profileError } = await supabase
      .from('user')
      .select('id, user_type')
      .eq('user_uuid', user.id)
      .single();

    if (profileError || !userProfile) {
      await supabase.auth.signOut(); // Clean up session
      console.error('Could not retrieve user profile:', profileError?.message);
      return NextResponse.json({ error: 'Could not retrieve user profile.' }, { status: 500 });
    }
    
    // 3. Check if user_type is Admin (2)
    if (userProfile.user_type !== 2) {
      await supabase.auth.signOut(); // Clean up session
      return NextResponse.json({ error: 'Access Denied. You are not an authorized Admin.' }, { status: 403 });
    }

    // 4. Check if admin is associated with any organization
    const { data: orgLink, error: orgLinkError } = await supabase
      .from('user_organisations')
      .select('organisation_id')
      .eq('user_id', userProfile.id)
      .limit(1) // We just need to know if at least one exists
      .maybeSingle();
    
    if (orgLinkError) {
      await supabase.auth.signOut(); // Clean up session
      console.error('Error checking organization link:', orgLinkError.message);
      return NextResponse.json({ error: 'Error verifying organization association.' }, { status: 500 });
    }

    if (!orgLink) {
      await supabase.auth.signOut(); // Clean up session
      return NextResponse.json({ error: 'Admin profile is not correctly associated with any organization.' }, { status: 403 });
    }
    
    // All checks passed, user is authenticated and authorized
    return NextResponse.json({ success: true, message: "Login successful" });

  } catch (e: any) {
    console.error('Unexpected error in login API:', e.message);
    return NextResponse.json({ error: 'An unexpected server error occurred.' }, { status: 500 });
  }
}
