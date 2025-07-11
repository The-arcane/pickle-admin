
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
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

  // refreshing the session cookie
  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const onSuperAdminLogin = pathname === '/super-admin/login';
  const onDashboardLogin = pathname === '/login';

  // If no user, and they are trying to access a protected route, redirect to the appropriate login page.
  if (!user) {
    if (pathname.startsWith('/super-admin/') && !onSuperAdminLogin) {
      return NextResponse.redirect(new URL('/super-admin/login', request.url));
    }
    if (pathname.startsWith('/dashboard') && !onDashboardLogin) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (pathname.startsWith('/employee') && !onDashboardLogin) {
      return NextResponse.redirect(new URL('/login?type=employee', request.url));
    }
    // Allow access to public pages (like login pages themselves) if no user
    return response;
  }
  
  // If there IS a user, check their profile and handle redirects.
  const { data: userProfile } = await supabase
    .from('user')
    .select('user_type')
    .eq('user_uuid', user.id)
    .single();

  const userType = userProfile?.user_type;

  // 1. If user is on a login page, redirect them to their dashboard
  if (onSuperAdminLogin || onDashboardLogin) {
    if (userType === 3) return NextResponse.redirect(new URL('/super-admin/dashboard', request.url));
    if (userType === 2) return NextResponse.redirect(new URL('/dashboard', request.url));
    if (userType === 4) return NextResponse.redirect(new URL('/employee/dashboard', request.url));
    // If they have no valid type, just let them see the login page.
    return response;
  }
  
  // 2. If user is on a protected route, ensure they have the correct role
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
      return NextResponse.redirect(new URL('/login?error=Access%20Denied&type=employee', request.url));
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
