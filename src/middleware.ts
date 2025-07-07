
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
  
  if (user) {
      const { data: userProfile } = await supabase
          .from('user')
          .select('user_type')
          .eq('user_uuid', user.id)
          .single();

      const userType = userProfile?.user_type;

      // If user is trying to access admin dashboard, but is not an admin (type 2)
      if (pathname.startsWith('/dashboard') && userType !== 2) {
          return NextResponse.redirect(new URL('/login?error=Access%20Denied', request.url));
      }

      // If user is trying to access employee dashboard, but is not an employee (type 4)
      if (pathname.startsWith('/employee') && userType !== 4) {
          return NextResponse.redirect(new URL('/login?error=Access%20Denied&type=employee', request.url));
      }
  } else {
      // If no user, redirect to login page, but allow access to login/signup pages
      if (pathname.startsWith('/dashboard') || pathname.startsWith('/employee')) {
          return NextResponse.redirect(new URL('/login', request.url));
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
