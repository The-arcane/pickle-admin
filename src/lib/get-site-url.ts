
export const getSiteURL = () => {
    let url =
      process.env.NEXT_PUBLIC_SITE_URL ?? // Set this to your local URL in .env.local
      process.env.NEXT_PUBLIC_VERCEL_URL ?? // Vercel deployment URL
      process.env.URL ??                    // Netlify deployment URL
      'http://localhost:9002';
      
    // Make sure to include `https://` when not localhost.
    url = url.includes('http') ? url : `https://${url}`;
    // Make sure to include a trailing `/`.
    url = url.charAt(url.length - 1) === '/' ? url : `${url}/`;
    return url;
};
