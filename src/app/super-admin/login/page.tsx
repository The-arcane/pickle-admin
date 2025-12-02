
'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// Redirect to the main login page
export default function SuperAdminLoginPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/login?type=super-admin');
    }, [router]);

    return null;
}
