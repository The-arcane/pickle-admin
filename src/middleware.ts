
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = await createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  const isSuperAdminLogin = pathname === '/super-admin/login';
  const isDashboardLogin = pathname === '/login';

  // If no user is logged in
  if (!user) {
    if (pathname.startsWith('/super-admin/') && !isSuperAdminLogin) {
      return NextResponse.redirect(new URL('/super-admin/login', request.url));
    }
    if (pathname.startsWith('/dashboard') && !isDashboardLogin) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (pathname.startsWith('/employee') && !isDashboardLogin) {
      return NextResponse.redirect(new URL('/login?type=employee', request.url));
    }
    return response; // Allow access to public pages like login
  }

  // If a user IS logged in, fetch their profile
  const { data: userProfile } = await supabase
    .from('user')
    .select('user_type')
    .eq('user_uuid', user.id)
    .single();

  const userType = userProfile?.user_type;

  // Handle redirects if user is on a login page
  if (isSuperAdminLogin || isDashboardLogin) {
    switch (userType) {
      case 2: // Admin
        return NextResponse.redirect(new URL('/dashboard', request.url));
      case 3: // Super Admin
        return NextResponse.redirect(new URL('/super-admin/dashboard', request.url));
      case 4: // Employee
        return NextResponse.redirect(new URL('/employee/dashboard', request.url));
      default:
        // If user has no type, just let them see the login page
        return response;
    }
  }

  // Handle access control for protected routes
  if (pathname.startsWith('/super-admin/') && userType !== 3) {
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL('/super-admin/login?error=Access%20Denied', request.url));
  }
  if (pathname.startsWith('/dashboard') && userType !== 2) {
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL('/login?error=Access%20Denied', request.url));
  }
  if (pathname.startsWith('/employee') && userType !== 4) {
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL('/login?type=employee&error=Access%20Denied', request.url));
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
