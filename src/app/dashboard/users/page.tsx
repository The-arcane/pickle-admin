import React from 'react';
import { StatusBadge } from '@/components/status-badge';

const users = [
  { name: 'Amit Kumar', email: 'amit.kumar@email.com', status: 'Active', avatar: 'https://randomuser.me/api/portraits/men/10.jpg' },
  { name: 'Sneha M.', email: 'sneha.m@email.com', status: 'Active', avatar: 'https://randomuser.me/api/portraits/women/11.jpg' },
  { name: 'Robert Fox', email: 'robert.fox@email.com', status: 'Inactive', avatar: 'https://randomuser.me/api/portraits/men/12.jpg' },
  { name: 'Courtney Henry', email: 'courtney.henry@email.com', status: 'Active', avatar: 'https://randomuser.me/api/portraits/women/13.jpg' },
];

function UsersPage() {
  return (
    <>
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Users</h1>
      <div className="bg-white rounded-2xl shadow p-8 max-w-3xl mx-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-gray-500 border-b">
              <th className="py-2 px-2 text-left font-medium">User</th>
              <th className="py-2 px-2 text-left font-medium">Email</th>
              <th className="py-2 px-2 text-left font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={i} className="border-b last:border-0">
                <td className="py-2 px-2 flex items-center gap-2">
                  <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover border border-gray-200" />
                  <span>{u.name}</span>
                </td>
                <td className="py-2 px-2">{u.email}</td>
                <td className="py-2 px-2">
                  <StatusBadge status={u.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default UsersPage;