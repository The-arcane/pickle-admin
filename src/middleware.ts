
import { NextResponse, type NextRequest } from 'next/server';
import { createServer } from '@/lib/supabase/server';
import { getSiteURL } from './lib/get-site-url';

export async function middleware(request: NextRequest) {
  const { supabase, response } = {
    supabase: await createServer(),
    response: NextResponse.next({
        request: {
          headers: request.headers,
        },
      }),
    };

  const { data: { session } } = await supabase.auth.getSession();
  const { pathname } = request.nextUrl;

  const user = session?.user;
  const siteUrl = getSiteURL();

  const protectedPaths = {
      dashboard: '/dashboard',
      superAdmin: '/super-admin',
      employee: '/employee'
  };

  const isProtectedRoute = Object.values(protectedPaths).some(p => pathname.startsWith(p));
  
  if (!user && isProtectedRoute) {
    let redirectUrl;
    if (pathname.startsWith(protectedPaths.superAdmin)) {
      redirectUrl = new URL('/login?type=super-admin', siteUrl);
    } else if (pathname.startsWith(protectedPaths.employee)) {
      redirectUrl = new URL('/login?type=employee', siteUrl);
    } else {
      redirectUrl = new URL('/login', siteUrl);
    }
    return NextResponse.redirect(redirectUrl);
  }

  if (user) {
    const { data: userProfile } = await supabase
        .from('user')
        .select('user_type')
        .eq('user_uuid', user.id)
        .single();
    
    // Redirect logged-in users from login pages to their respective dashboards
    if (pathname.startsWith('/login') || pathname === '/') {
      if (userProfile?.user_type === 2) return NextResponse.redirect(new URL(protectedPaths.dashboard, siteUrl));
      if (userProfile?.user_type === 3) return NextResponse.redirect(new URL(protectedPaths.superAdmin, siteUrl));
      if (userProfile?.user_type === 4) return NextResponse.redirect(new URL(protectedPaths.employee, siteUrl));
    }

    // Enforce role-based access to protected routes
    if (pathname.startsWith(protectedPaths.dashboard) && userProfile?.user_type !== 2) {
      await supabase.auth.signOut();
      return NextResponse.redirect(new URL('/login?error=Access%20Denied', siteUrl));
    }
    if (pathname.startsWith(protectedPaths.superAdmin) && userProfile?.user_type !== 3) {
      await supabase.auth.signOut();
      return NextResponse.redirect(new URL('/login?type=super-admin&error=Access%20Denied', siteUrl));
    }
    if (pathname.startsWith(protectedPaths.employee) && userProfile?.user_type !== 4) {
      await supabase.auth.signOut();
      return NextResponse.redirect(new URL('/login?type=employee&error=Access%20Denied', siteUrl));
    }
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
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
