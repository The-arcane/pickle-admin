
import { Suspense } from 'react';
import { SuperAdminLoginForm } from './client';

export const dynamic = 'force-dynamic';

export default function SuperAdminLoginPage() {
    // Page-level redirects were causing loops with the middleware.
    // The login form and server action will handle all logic now.
    return (
        <Suspense>
            <SuperAdminLoginForm />
        </Suspense>
    );
}
