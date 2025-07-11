
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

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  // If user is logged in, fetch their profile
  const userType = user 
    ? (await supabase.from('user').select('user_type').eq('user_uuid', user.id).single()).data?.user_type
    : null;

  const isSuperAdminLogin = pathname === '/super-admin/login';
  const isAdminOrEmployeeLogin = pathname === '/login';

  // If the user is logged in, and tries to access a login page, redirect them to their dashboard
  if (user && userType) {
    if(isSuperAdminLogin || isAdminOrEmployeeLogin) {
      if (userType === 3) return NextResponse.redirect(new URL('/super-admin/dashboard', request.url));
      if (userType === 2) return NextResponse.redirect(new URL('/dashboard', request.url));
      if (userType === 4) return NextResponse.redirect(new URL('/employee/dashboard', request.url));
    }
  }

  // Define protected routes and the required user type for each
  const protectedRoutes: { path: string, requiredType: number }[] = [
    { path: '/dashboard', requiredType: 2 },
    { path: '/super-admin', requiredType: 3 },
    { path: '/employee', requiredType: 4 },
  ];

  for (const route of protectedRoutes) {
    if (pathname.startsWith(route.path)) {
      if (!user) {
        // Not logged in, redirect to the appropriate login page
        const loginUrl = route.path === '/super-admin' ? '/super-admin/login' : '/login';
        const finalUrl = route.path === '/employee' ? '/login?type=employee' : loginUrl;
        return NextResponse.redirect(new URL(finalUrl, request.url));
      }
      if (userType !== route.requiredType) {
        // Logged in, but wrong user type. Log them out and redirect.
        await supabase.auth.signOut();
        const loginUrl = route.path === '/super-admin' ? '/super-admin/login' : '/login';
        const finalUrl = route.path === '/employee' ? '/login?type=employee' : loginUrl;
        return NextResponse.redirect(new URL(`${finalUrl}?error=Access%20Denied`, request.url));
      }
      // User is logged in and has the correct type, allow access
      return response;
    }
  }

  // Allow access to public routes (like login pages if not already logged in)
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
