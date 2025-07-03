import React from 'react';
import { StatusBadge } from '@/components/status-badge';

const courts = [
  { name: 'Pickleball Court 01', venue: 'Uniworld Pickleball Complex', type: 'Indoor', maxPlayers: 'Single', status: 'Open' },
  { name: 'Court A – Smash Zone', venue: 'SmashArena Sports Club', type: 'Outdoor', maxPlayers: 'Dabal', status: 'Closed' },
  { name: 'Court B – Paddle Peak', venue: 'The Paddle Hub', type: 'Indoor', maxPlayers: 'Single', status: 'Maintenance' },
  { name: 'Badminton Court 01', venue: 'NetZone Playgrounds', type: 'Outdoor', maxPlayers: 'Dabal', status: 'Open' },
  { name: 'Court C – Rally Deck', venue: 'Uniworld Pickleball Complex', type: 'Indoor', maxPlayers: 'Single', status: 'Open' },
  { name: 'Court D – Net Square', venue: 'AceCourt Athletic Center', type: 'Indoor', maxPlayers: 'Single', status: 'Closed' },
  { name: 'Court E – PowerPlay Court', venue: 'Uniworld Pickleball Complex', type: 'Indoor', maxPlayers: 'Double', status: 'Open' },
  { name: 'Court F – East Wing Arena', venue: 'Urban Rally Grounds', type: 'Outdoor', maxPlayers: 'Single', status: 'Maintenance' },
  { name: 'Court G – SpinSide Court', venue: 'The Paddle Hub', type: 'Indoor', maxPlayers: 'Single', status: 'Open' },
  { name: 'Court H – SpeedLane Court', venue: 'Uniworld Pickleball Complex', type: 'Indoor', maxPlayers: 'Single', status: 'Open' },
];

function CourtListPage() {
  return (
    <>
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Court Management</h1>
      <div className="bg-white rounded-2xl shadow p-8 max-w-5xl mx-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-gray-500 border-b">
              <th className="py-2 px-2 text-left font-medium">Court</th>
              <th className="py-2 px-2 text-left font-medium">Venue</th>
              <th className="py-2 px-2 text-left font-medium">Court Type</th>
              <th className="py-2 px-2 text-left font-medium">Max Players</th>
              <th className="py-2 px-2 text-left font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {courts.map((c, i) => (
              <tr key={i} className="border-b last:border-0">
                <td className="py-2 px-2">{c.name}</td>
                <td className="py-2 px-2">{c.venue}</td>
                <td className="py-2 px-2">{c.type}</td>
                <td className="py-2 px-2">{c.maxPlayers}</td>
                <td className="py-2 px-2"><StatusBadge status={c.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default CourtListPage;