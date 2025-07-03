import React from 'react';
import { StatusBadge } from '@/components/status-badge';

const bookings = [
  { user: 'Amit Kumar', court: 'East Court', date: 'Apr 30, 2025', time: '5:00 PM', status: 'Confirmed' },
  { user: 'Sneha M.', court: 'West Court', date: 'Apr 30, 2025', time: '7:00 PM', status: 'Pending' },
  { user: 'Robert Fox', court: 'Center Court', date: 'May 01, 2025', time: '6:00 PM', status: 'Cancelled' },
];


function BookingsPage() {
  return (
    <>
        <h1 className="text-2xl font-bold text-gray-800 mb-8">Bookings</h1>
        <div className="bg-white rounded-2xl shadow p-8 max-w-3xl mx-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-gray-500 border-b">
                <th className="py-2 px-2 text-left font-medium">User</th>
                <th className="py-2 px-2 text-left font-medium">Court</th>
                <th className="py-2 px-2 text-left font-medium">Date</th>
                <th className="py-2 px-2 text-left font-medium">Time</th>
                <th className="py-2 px-2 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="py-2 px-2">{b.user}</td>
                  <td className="py-2 px-2">{b.court}</td>
                  <td className="py-2 px-2">{b.date}</td>
                  <td className="py-2 px-2">{b.time}</td>
                  <td className="py-2 px-2"><StatusBadge status={b.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
    </>
  );
}

export default BookingsPage;