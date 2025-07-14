
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createServer(useServiceRoleKey = false) {
  const cookieStore = cookies();

  // Next.js automatically loads variables from .env.local.
  // The `NEXT_PUBLIC_` prefix makes them available to the browser,
  // while server-only variables without the prefix are secure.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = useServiceRoleKey 
    ? process.env.SUPABASE_SERVICE_ROLE_KEY! 
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (useServiceRoleKey && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("SUPABASE_SERVICE_ROLE_KEY is not set in your .env.local file. This is required for admin actions.");
  }
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Your project's URL and Key are required to create a Supabase client! Check your .env.local file.");
  }

  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}
