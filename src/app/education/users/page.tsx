
'use client';
// Renaming this file to admin-users/page.tsx would be better, but for now we'll call it users
// to avoid breaking existing navigation logic until all modules are created.

import { createServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { UsersClientPage } from './client';
import type { UserWithRole, Role } from './types';


// Mock Data
const mockAdminUsers = [
    { user: { id: 1, name: 'Amit Sharma', email: 'amit@example.com', profile_image_url: null, created_at: new Date().toISOString(), is_deleted: false, phone: '123-456-7890' }, role: { id: 1, name: 'PE Teacher' } },
    { user: { id: 2, name: 'Neha Kapoor', email: 'neha@example.com', profile_image_url: null, created_at: new Date().toISOString(), is_deleted: false, phone: '123-456-7890' }, role: { id: 2, name: 'Event Manager' } },
    { user: { id: 3, name: 'School Principal', email: 'principal@example.com', profile_image_url: null, created_at: new Date().toISOString(), is_deleted: false, phone: '123-456-7890' }, role: { id: 3, name: 'Admin' } },
];

const mockRoles = [
    { id: 1, name: 'PE Teacher' },
    { id: 2, name: 'Event Manager' },
    { id: 3, name: 'Admin' },
];

export default function EducationUsersPage() {

  const users = mockAdminUsers as UserWithRole[];
  const roles = mockRoles as Role[];

  return <UsersClientPage users={users} roles={roles} />;
}
