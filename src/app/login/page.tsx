
'use client';

import { redirect } from 'next/navigation';
import { useEffect } from 'react';

// This page is now redundant. Redirect any traffic to the root login page.
export default function LoginPage() {
  useEffect(() => {
    redirect('/');
  }, []);

  return null;
}
