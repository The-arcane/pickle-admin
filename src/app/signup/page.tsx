
import { Suspense } from 'react';
import { SignupForm } from './client';

export const dynamic = 'force-dynamic';

export default function SignupPage() {
    return (
        <Suspense>
            <SignupForm />
        </Suspense>
    );
}
