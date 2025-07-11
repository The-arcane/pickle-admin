
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
  
  const isSuperAdminRoute = pathname.startsWith('/super-admin');
  const isAdminRoute = pathname.startsWith('/dashboard');
  const isEmployeeRoute = pathname.startsWith('/employee');
  
  const isSuperAdminLogin = pathname === '/super-admin/login';
  const isAdminLogin = pathname === '/login' && request.nextUrl.searchParams.get('type') !== 'employee';
  const isEmployeeLogin = pathname === '/login' && request.nextUrl.searchParams.get('type') === 'employee';

  if (!user) {
    if (isSuperAdminRoute && !isSuperAdminLogin) {
      return NextResponse.redirect(new URL('/super-admin/login', request.url));
    }
    if (isAdminRoute) { // No need to check for !isAdminLogin as it's a public page
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (isEmployeeRoute) { // No need to check for !isEmployeeLogin
      return NextResponse.redirect(new URL('/login?type=employee', request.url));
    }
    return response;
  }
  
  // If user is logged in, fetch their profile
  const { data: userProfile } = await supabase
    .from('user')
    .select('user_type')
    .eq('user_uuid', user.id)
    .single();

  const userType = userProfile?.user_type;

  // Handle redirects for logged-in users trying to access login pages
  if (isSuperAdminLogin || isAdminLogin || isEmployeeLogin) {
    switch(userType) {
        case 2: return NextResponse.redirect(new URL('/dashboard', request.url));
        case 3: return NextResponse.redirect(new URL('/super-admin/dashboard', request.url));
        case 4: return NextResponse.redirect(new URL('/employee/dashboard', request.url));
        default: return response; // Let them stay if type is unknown
    }
  }

  // Enforce access control for protected routes
  if (isSuperAdminRoute && userType !== 3) {
      await supabase.auth.signOut();
      return NextResponse.redirect(new URL('/super-admin/login?error=Access%20Denied', request.url));
  }
  if (isAdminRoute && userType !== 2) {
      await supabase.auth.signOut();
      return NextResponse.redirect(new URL('/login?error=Access%20Denied', request.url));
  }
  if (isEmployeeRoute && userType !== 4) {
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
