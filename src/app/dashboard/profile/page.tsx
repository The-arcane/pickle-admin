import React from 'react';

function UserPage() {
  return (
    <>
      <h1 className="text-2xl font-bold text-gray-800 mb-8">User Profile</h1>
      <div className="bg-white rounded-2xl shadow p-8 max-w-xl mx-auto">
        <div className="flex items-center gap-6 mb-8">
          <img src="https://randomuser.me/api/portraits/men/10.jpg" alt="User" className="w-20 h-20 rounded-full object-cover border-2 border-cyan-200" />
          <div>
            <div className="text-xl font-bold text-gray-800">Amit Kumar</div>
            <div className="text-gray-500">amit.kumar@email.com</div>
            <div className="text-gray-400 text-sm">Member since Jan 2024</div>
          </div>
        </div>
        <form className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Full Name</label>
            <input className="w-full border border-gray-200 rounded px-3 py-2" defaultValue="Amit Kumar" />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Email</label>
            <input className="w-full border border-gray-200 rounded px-3 py-2" defaultValue="amit.kumar@email.com" />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Phone</label>
            <input className="w-full border border-gray-200 rounded px-3 py-2" defaultValue="+91 9876543210" />
          </div>
          <button type="submit" className="bg-cyan-500 text-white font-bold px-6 py-2 rounded-lg shadow hover:bg-cyan-600 transition-all">Save Changes</button>
        </form>
        <div className="mt-8">
          <div className="font-semibold text-lg mb-2">Activity Summary</div>
          <ul className="text-gray-700 text-sm space-y-1">
            <li>Bookings made: <span className="font-bold">24</span></li>
            <li>Events attended: <span className="font-bold">5</span></li>
            <li>Feedback given: <span className="font-bold">3</span></li>
          </ul>
        </div>
      </div>
    </>
  );
}

export default UserPage;