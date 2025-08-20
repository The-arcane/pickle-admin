

import { redirect } from 'next/navigation';

// Super admin root should redirect to the dashboard
export default function SuperAdminRootPage() {
    redirect('/super-admin/dashboard');
}

