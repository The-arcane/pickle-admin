import React from 'react';

export function StatusBadge({ status }: { status: string }) {
  let color;
  switch (status) {
    case 'Confirmed':
    case 'Open':
    case 'Active':
      color = 'bg-green-100 text-green-700';
      break;
    case 'Pending':
    case 'Maintenance':
      color = 'bg-yellow-100 text-yellow-800';
      break;
    case 'Cancelled':
    case 'Closed':
      color = 'bg-red-100 text-red-700';
      break;
    case 'Inactive':
        color = 'bg-gray-200 text-gray-600';
        break;
    default:
      color = 'bg-gray-300 text-gray-700';
  }
  return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${color}`}>{status}</span>;
}
