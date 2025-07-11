
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

  // If a user is logged in, check their permissions for protected routes
  if (user) {
      const { data: userProfile } = await supabase
          .from('user')
          .select('user_type')
          .eq('user_uuid', user.id)
          .single();

      const userType = userProfile?.user_type;

      // If user is on a login page, redirect them to their respective dashboard
      if (pathname.startsWith('/login') || pathname.startsWith('/super-admin/login')) {
         if (userType === 3) return NextResponse.redirect(new URL('/super-admin/dashboard', request.url));
         if (userType === 2) return NextResponse.redirect(new URL('/dashboard', request.url));
         if (userType === 4) return NextResponse.redirect(new URL('/employee/dashboard', request.url));
      }
      
      // If user is trying to access a protected route, verify their type
      if (pathname.startsWith('/super-admin') && userType !== 3) {
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

  } else {
      // If no user, redirect to the correct login page for any protected route
      if (pathname.startsWith('/super-admin/') && !pathname.startsWith('/super-admin/login')) {
          return NextResponse.redirect(new URL('/super-admin/login', request.url));
      }
      if (pathname.startsWith('/dashboard')) {
          return NextResponse.redirect(new URL('/login', request.url));
      }
      if (pathname.startsWith('/employee')) {
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
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
