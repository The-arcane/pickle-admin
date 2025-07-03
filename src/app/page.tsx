'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// This component is rendered on the server, but we need to use a client-side
// hook to perform the redirect. We can still benefit from SSR for the initial
// page load. The redirect will happen on the client after hydration.
export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/login');
  }, [router]);

  // Return null as the redirect will happen on the client
  return null;
}
