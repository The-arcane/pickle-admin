
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
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  const userProfile = user ? (await supabase.from('user').select('user_type').eq('user_uuid', user.id).single()).data : null;
  const userType = userProfile?.user_type;

  // Define route mappings
  const adminRoutes = ['/dashboard'];
  const superAdminRoutes = ['/super-admin'];
  const employeeRoutes = ['/employee'];
  const loginRoutes = ['/login', '/super-admin/login'];

  const isProtectedRoute = (routes: string[]) => routes.some(route => pathname.startsWith(route));

  // If user is logged in
  if (user && userType) {
    // If they are on a login page, redirect to their dashboard
    if (loginRoutes.includes(pathname)) {
      if (userType === 2) return NextResponse.redirect(new URL('/dashboard', request.url));
      if (userType === 3) return NextResponse.redirect(new URL('/super-admin/dashboard', request.url));
      if (userType === 4) return NextResponse.redirect(new URL('/employee/dashboard', request.url));
    }
    
    // Enforce role-based access
    if (isProtectedRoute(adminRoutes) && userType !== 2) {
      await supabase.auth.signOut();
      return NextResponse.redirect(new URL('/login?error=Access%20Denied', request.url));
    }
    if (isProtectedRoute(superAdminRoutes) && userType !== 3) {
      await supabase.auth.signOut();
      return NextResponse.redirect(new URL('/super-admin/login?error=Access%20Denied', request.url));
    }
    if (isProtectedRoute(employeeRoutes) && userType !== 4) {
      await supabase.auth.signOut();
      return NextResponse.redirect(new URL('/login?type=employee&error=Access%20Denied', request.url));
    }

  } else { // If user is not logged in
    // Protect routes
    if (isProtectedRoute(adminRoutes)) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (isProtectedRoute(superAdminRoutes)) {
      return NextResponse.redirect(new URL('/super-admin/login', request.url));
    }
    if (isProtectedRoute(employeeRoutes)) {
      return NextResponse.redirect(new URL('/login?type=employee', request.url));
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
