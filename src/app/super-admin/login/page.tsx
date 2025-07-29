
'use client';
import { SuperAdminLoginForm } from './client';
import { Suspense } from 'react';

export default function SuperAdminLoginPage() {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <SuperAdminLoginForm />
      </Suspense>
    );
}
