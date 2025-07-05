
import { Suspense } from 'react';
import { LoginForm } from './client';

export const dynamic = 'force-dynamic';

export default function LoginPage() {
    return (
        <Suspense>
            <LoginForm />
        </Suspense>
    );
}
