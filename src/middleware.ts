
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options) {
        request.cookies.set({ name, value, ...options });
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options) {
        request.cookies.set({ name, value: '', ...options });
        response.cookies.set({ name, value: '', ...options });
      },
    },
  });
  
  // Add cache-control headers to prevent browser caching of redirects
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  response.headers.set('Surrogate-Control', 'no-store');

  const { data: { session } } = await supabase.auth.getSession();
  const { pathname } = request.nextUrl;

  const user = session?.user;
  const siteUrl = request.nextUrl.origin;

  const protectedPaths = {
      dashboard: '/dashboard',
      superAdmin: '/super-admin',
      employee: '/employee',
      sales: '/sales',
      education: '/education',
  };

  const loginPaths = {
      admin: '/login',
      superAdmin: '/login?type=super-admin',
      employee: '/login?type=employee',
      sales: '/login?type=sales',
      education: '/login?type=education',
  }

  // If user is not logged in and is trying to access a protected route, redirect to login
  if (!user) {
    if (Object.values(protectedPaths).some(p => pathname.startsWith(p) && p !== '/')) {
        let redirectUrl = loginPaths.admin; // Default login
        if (pathname.startsWith(protectedPaths.superAdmin)) redirectUrl = loginPaths.superAdmin;
        if (pathname.startsWith(protectedPaths.employee)) redirectUrl = loginPaths.employee;
        if (pathname.startsWith(protectedPaths.sales)) redirectUrl = loginPaths.sales;
        if (pathname.startsWith(protectedPaths.education)) redirectUrl = loginPaths.education;
        return NextResponse.redirect(new URL(redirectUrl, siteUrl));
    }
    return response;
  }
  
  // If user is logged in, fetch their profile
  const { data: userProfile } = await supabase
    .from('user')
    .select('id, user_type')
    .eq('user_uuid', user.id)
    .single();

  if (!userProfile) {
    // If profile doesn't exist, something is wrong. Sign out and redirect to login.
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL('/login?error=User%20profile%20not%20found.', siteUrl));
  }
  
  const { user_type } = userProfile;
  
  // If a logged-in user tries to access any login page, redirect them to their dashboard
  if (pathname.startsWith('/login')) {
    if (user_type === 2) return NextResponse.redirect(new URL(protectedPaths.dashboard, siteUrl));
    if (user_type === 3) return NextResponse.redirect(new URL(protectedPaths.superAdmin, siteUrl));
    if (user_type === 4) return NextResponse.redirect(new URL(protectedPaths.employee, siteUrl));
    if (user_type === 6) return NextResponse.redirect(new URL(protectedPaths.sales, siteUrl));
    if (user_type === 7) return NextResponse.redirect(new URL(protectedPaths.education, siteUrl));
  }
  
  // Role-based access control - redirect if they are in the wrong panel
  if (user_type === 2 && !pathname.startsWith(protectedPaths.dashboard)) {
      return NextResponse.redirect(new URL(protectedPaths.dashboard, siteUrl));
  }
  if (user_type === 3 && !pathname.startsWith(protectedPaths.superAdmin)) {
      return NextResponse.redirect(new URL(protectedPaths.superAdmin, siteUrl));
  }
  if (user_type === 4 && !pathname.startsWith(protectedPaths.employee)) {
      return NextResponse.redirect(new URL(protectedPaths.employee, siteUrl));
  }
  if (user_type === 6 && !pathname.startsWith(protectedPaths.sales)) {
      return NextResponse.redirect(new URL(protectedPaths.sales, siteUrl));
  }
  if (user_type === 7 && !pathname.startsWith(protectedPaths.education)) {
      return NextResponse.redirect(new URL(protectedPaths.education, siteUrl));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/ (API routes)
     * - o/ (Public organization pages)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|api/|o/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
