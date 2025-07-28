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

  // Define protected routes
  const protectedPaths = ['/dashboard', '/super-admin', '/employee'];
  const isProtected = protectedPaths.some(path => pathname.startsWith(path));
  
  // If the user is not logged in and is trying to access a protected route
  if (!user && isProtected) {
    const redirectUrl = new URL('/login', getSiteURL());
    if (pathname.startsWith('/super-admin')) {
      redirectUrl.searchParams.set('type', 'super-admin');
    } else if (pathname.startsWith('/employee')) {
      redirectUrl.searchParams.set('type', 'employee');
    }
    return NextResponse.redirect(redirectUrl);
  }

  // If user is logged in, prevent access to login pages
  if (user && pathname.startsWith('/login')) {
      const { data: userProfile } = await supabase
        .from('user')
        .select('user_type')
        .eq('user_uuid', user.id)
        .single();
        
      if(userProfile) {
        switch (userProfile.user_type) {
            case 2: return NextResponse.redirect(new URL('/dashboard', getSiteURL()));
            case 3: return NextResponse.redirect(new URL('/super-admin/dashboard', getSiteURL()));
            case 4: return NextResponse.redirect(new URL('/employee/dashboard', getSiteURL()));
        }
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
