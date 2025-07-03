import React from 'react';
import { StatusBadge } from '@/components/status-badge';

const bookings = [
  { user: 'Courtney Henry', court: 'East Court', date: 'Apr 30, 2025', time: '5:00 PM', status: 'Confirmed', avatar: 'https://randomuser.me/api/portraits/women/1.jpg' },
  { user: 'Guy Hawkins', court: 'East Court', date: 'Apr 30, 2025', time: '5:00 PM', status: 'Confirmed', avatar: 'https://randomuser.me/api/portraits/men/2.jpg' },
  { user: 'Robert Fox', court: 'West Court', date: 'Apr 30, 2025', time: '7:00 PM', status: 'Pending', avatar: 'https://randomuser.me/api/portraits/men/3.jpg' },
  { user: 'Jacob Jones', court: 'Center Court', date: 'May 01, 2025', time: '6:00 PM', status: 'Confirmed', avatar: 'https://randomuser.me/api/portraits/men/4.jpg' },
  { user: 'Albert Flores', court: 'West Court', date: 'Apr 30, 2025', time: '7:00 PM', status: 'Pending', avatar: 'https://randomuser.me/api/portraits/men/5.jpg' },
  { user: 'Marvin McKinney', court: 'East Court', date: 'Apr 30, 2025', time: '9:00 PM', status: 'Cancelled', avatar: 'https://randomuser.me/api/portraits/men/6.jpg' },
  { user: 'Dianne Russell', court: 'Center Court', date: 'Apr 30, 2025', time: '9:00 PM', status: 'Cancelled', avatar: 'https://randomuser.me/api/portraits/women/7.jpg' },
  { user: 'Devon Lane', court: 'East Court', date: 'Apr 30, 2025', time: '9:00 PM', status: 'Cancelled', avatar: 'https://randomuser.me/api/portraits/men/8.jpg' },
];

const stats = [
  { label: "Today's Bookings", value: 12, icon: 'calendar' },
  { label: 'Total Revenue', value: '₹18,200', icon: 'chart' },
  { label: 'Upcoming Slots', value: 6, icon: 'clock' },
  { label: 'Chatbot Interactions', value: 412, icon: 'chat' },
];

const chatbotStats = {
  total: 412,
  autoSolved: 25,
  transfers: 6,
  topIntent: 412,
};

const feedback = {
  rating: 4.7,
  comment: 'Loved the smooth booking process. Will play again!',
  user: 'Sneha M.'
};

function DashboardPage() {
  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1 flex items-center gap-2">
            Welcome Back, Amit! <span className="text-2xl">👋</span>
          </h1>
          <div className="text-gray-500 text-sm">Your PickleballBot is running smoothly today.</div>
        </div>
        <div className="flex gap-2">
          <button className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Customize UI</button>
          <button className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Edit Message</button>
          <button className="bg-cyan-500 text-white rounded-lg px-4 py-2 text-sm font-semibold shadow hover:bg-cyan-600">Manage Courts</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow-sm p-5 flex flex-col items-center">
            <div className="w-10 h-10 bg-cyan-50 rounded-full flex items-center justify-center mb-2">
              <span className="text-cyan-600 text-xl">{stat.icon === 'calendar' ? '📅' : stat.icon === 'chart' ? '📊' : stat.icon === 'clock' ? '⏰' : '💬'}</span>
            </div>
            <div className="text-2xl font-bold text-cyan-700">{stat.value}</div>
            <div className="text-xs text-gray-500 mt-1 text-center">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Booking Activity */}
        <div className="bg-white rounded-2xl shadow p-6 col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="font-semibold text-lg text-gray-800">Recent Booking Activity</div>
            <select className="border border-gray-200 rounded px-2 py-1 text-sm text-gray-600">
              <option>All</option>
              <option>Confirmed</option>
              <option>Pending</option>
              <option>Cancelled</option>
            </select>
          </div>
          <div className="overflow-x-auto">
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
                    <td className="py-2 px-2 flex items-center gap-2">
                      <img src={b.avatar} alt={b.user} className="w-7 h-7 rounded-full object-cover border border-gray-200" />
                      <span>{b.user}</span>
                    </td>
                    <td className="py-2 px-2">{b.court}</td>
                    <td className="py-2 px-2">{b.date}</td>
                    <td className="py-2 px-2">{b.time}</td>
                    <td className="py-2 px-2"><StatusBadge status={b.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Chatbot Usage & Feedback */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-2xl shadow p-6">
            <div className="font-semibold text-lg text-gray-800 mb-2">Chatbot Usage Today</div>
            <div className="flex flex-col gap-2 text-sm text-gray-700">
              <div className="flex justify-between"><span>Total Messages Handled</span><span className="font-semibold">{chatbotStats.total}</span></div>
              <div className="flex justify-between"><span>Auto-Solved Queries</span><span>{chatbotStats.autoSolved}</span></div>
              <div className="flex justify-between"><span>Live Support Transfers</span><span>{chatbotStats.transfers}</span></div>
              <div className="flex justify-between"><span>Top Intent</span><span>{chatbotStats.topIntent}</span></div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow p-6">
            <div className="font-semibold text-lg text-gray-800 mb-2">Customer Feedback</div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-gray-600">Average Rating:</span>
              <span className="text-yellow-500 font-bold">★ {feedback.rating}/5</span>
            </div>
            <div className="text-gray-700 text-sm italic mb-1">"{feedback.comment}"</div>
            <div className="text-xs text-gray-400 text-right">{feedback.user}</div>
          </div>
        </div>
      </div>
    </>
  );
}

export default DashboardPage;
