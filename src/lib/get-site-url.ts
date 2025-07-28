// A helper function to determine the site URL for Supabase handshaking.
// This is used in the Supabase client and server configurations.
export const getSiteURL = () => {
    let url =
      process.env.NEXT_PUBLIC_SITE_URL ?? // Set this to your production URL in your hosting provider environment variables
      process.env.NEXT_PUBLIC_VERCEL_URL ?? // Vercel automatically sets this
      'http://localhost:9002/';
    // Make sure to include `https://` when setting the environment variable.
    url = url.includes('http') ? url : `https://${url}`;
    // Make sure to include a trailing `/`.
    url = url.charAt(url.length - 1) === '/' ? url : `${url}/`;
    return url;
  };
  