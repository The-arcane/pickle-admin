import { Suspense } from 'react';
import { SuperAdminLoginForm } from './client';

export const dynamic = 'force-dynamic';

export default function SuperAdminLoginPage() {
    return (
        <Suspense>
            <SuperAdminLoginForm />
        </Suspense>
    );
}
