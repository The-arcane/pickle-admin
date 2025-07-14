
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import 'dotenv/config';

export async function createServer(useServiceRoleKey = false) {
  const cookieStore = cookies();

  // Ensure these are read from server-side environment variables
  const supabaseUrl = process.env.SUPABASE_URL!;
  const supabaseKey = useServiceRoleKey 
    ? process.env.SUPABASE_SERVICE_ROLE_KEY! 
    : process.env.SUPABASE_ANON_KEY!;

  if (useServiceRoleKey && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("SUPABASE_SERVICE_ROLE_KEY is not set. This is required for admin actions like deleting users.");
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
