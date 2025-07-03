import React from 'react';

function SettingsPage() {
  return (
    <>
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Settings</h1>
      <div className="bg-white rounded-2xl shadow p-8 max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="font-semibold text-lg mb-2">THEME SETTING</div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-700">Theme</span>
            <select className="border border-gray-200 rounded px-3 py-1 text-sm">
              <option>System theme</option>
              <option>Light</option>
              <option>Dark</option>
            </select>
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-700">Customize UI</span>
            <button className="flex items-center gap-1 px-3 py-1 border border-gray-200 rounded text-sm text-gray-700 hover:bg-gray-50">
              <span>Edit</span>
            </button>
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-700">Receive New Recommendations</span>
            <input type="checkbox" className="form-checkbox h-5 w-5 text-cyan-600" />
          </div>
        </div>
        <div className="mb-4">
          <div className="font-semibold text-lg mb-2">ACCOUNT SETTINGS</div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-700">Update Password</span>
            <button className="px-3 py-1 border border-gray-200 rounded text-sm text-gray-700 hover:bg-gray-50">Update</button>
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-700">Sign in with Google</span>
            <button className="px-3 py-1 border border-gray-200 rounded text-sm text-gray-700 hover:bg-gray-50">Unlink Account</button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Delete Account</span>
            <button className="px-3 py-1 bg-red-500 text-white rounded text-sm font-semibold hover:bg-red-600">Delete Account</button>
          </div>
        </div>
      </div>
    </>
  );
}

export default SettingsPage;