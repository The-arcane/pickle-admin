
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
        response.cookies.set({ name, value: ...options });
      },
    },
  });
  
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  response.headers.set('Surrogate-Control', 'no-store');

  const { data: { session } } = await supabase.auth.getSession();
  const { pathname } = request.nextUrl;

  const user = session?.user;
  const siteUrl = request.nextUrl.origin;
  const loginUrl = '/';

  const protectedPaths = {
      livingspace: '/livingspace',
      superAdmin: '/super-admin',
      employee: '/employee',
      sales: '/sales',
      education: '/education',
      hospitality: '/hospitality',
      arena: '/arena',
  };

  // If user is not logged in and is trying to access a protected route, redirect to login page at root
  if (!user && Object.values(protectedPaths).some(p => pathname.startsWith(p))) {
      return NextResponse.redirect(new URL(loginUrl, siteUrl));
  }
  
  // If user is logged in, fetch their profile
  if (user) {
    const { data: userProfile } = await supabase
      .from('user')
      .select('id, user_type')
      .eq('user_uuid', user.id)
      .single();

    if (!userProfile) {
      await supabase.auth.signOut();
      return NextResponse.redirect(new URL('/?error=User%20profile%20not%20found.', siteUrl));
    }
    
    const { user_type } = userProfile;
    
    // If a logged-in user tries to access the root (login page), redirect them to their dashboard
    if (pathname === '/') {
      if (user_type === 2) return NextResponse.redirect(new URL(protectedPaths.livingspace, siteUrl));
      if (user_type === 3) return NextResponse.redirect(new URL(protectedPaths.superAdmin, siteUrl));
      if (user_type === 4) return NextResponse.redirect(new URL(protectedPaths.employee, siteUrl));
      if (user_type === 6) return NextResponse.redirect(new URL(protectedPaths.sales, siteUrl));
      if (user_type === 7) return NextResponse.redirect(new URL(protectedPaths.education, siteUrl));
      if (user_type === 8) return NextResponse.redirect(new URL(protectedPaths.hospitality, siteUrl));
      if (user_type === 9) return NextResponse.redirect(new URL(protectedPaths.arena, siteUrl));
    }
    
    // Role-based access control - redirect if they are in the wrong panel
    if (user_type === 2 && !pathname.startsWith(protectedPaths.livingspace) && !pathname.startsWith('/o/')) {
        return NextResponse.redirect(new URL(protectedPaths.livingspace, siteUrl));
    }
    if (user_type === 3 && !pathname.startsWith(protectedPaths.superAdmin) && !pathname.startsWith('/o/')) {
        return NextResponse.redirect(new URL(protectedPaths.superAdmin, siteUrl));
    }
    if (user_type === 4 && !pathname.startsWith(protectedPaths.employee) && !pathname.startsWith('/o/')) {
        return NextResponse.redirect(new URL(protectedPaths.employee, siteUrl));
    }
    if (user_type === 6 && !pathname.startsWith(protectedPaths.sales) && !pathname.startsWith('/o/')) {
        return NextResponse.redirect(new URL(protectedPaths.sales, siteUrl));
    }
    if (user_type === 7 && !pathname.startsWith(protectedPaths.education) && !pathname.startsWith('/o/')) {
        return NextResponse.redirect(new URL(protectedPaths.education, siteUrl));
    }
    if (user_type === 8 && !pathname.startsWith(protectedPaths.hospitality) && !pathname.startsWith('/o/')) {
        return NextResponse.redirect(new URL(protectedPaths.hospitality, siteUrl));
    }
    if (user_type === 9 && !pathname.startsWith(protectedPaths.arena) && !pathname.startsWith('/o/')) {
        return NextResponse.redirect(new URL(protectedPaths.arena, siteUrl));
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
     * - o/ (Public Living Space pages)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
