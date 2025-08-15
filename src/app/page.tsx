
import { Suspense } from 'react';
import { LoginForm } from './login/client';

export const dynamic = 'force-dynamic';

// This is now the main login page for the application.
export default function Home() {
    return (
        <Suspense>
            <LoginForm />
        </Suspense>
    );
}
