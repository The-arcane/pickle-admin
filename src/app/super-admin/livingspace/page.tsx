import { createServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default function SuperAdminLivingSpaceRedirect() {
    // This page is a duplicate of /super-admin/organisations
    // We will redirect to the correct page to avoid content duplication.
    redirect('/super-admin/organisations');
    return null;
}
