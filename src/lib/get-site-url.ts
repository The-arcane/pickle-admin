
export const getSiteURL = () => {
  let url =
    process.env.NEXT_PUBLIC_SITE_URL || // Set this to your custom domain in .env.local
    process.env.NEXT_PUBLIC_VERCEL_URL || // Automatically set by Vercel
    process.env.URL ||                    // Automatically set by Netlify
    'http://localhost:9002';
    
  // Make sure to include `https://` when not localhost.
  url = url.includes('http') ? url : `https://${url}`;
  // Make sure to include a trailing `/`.
  url = url.charAt(url.length - 1) === '/' ? url : `${url}/`;
  return url;
};
