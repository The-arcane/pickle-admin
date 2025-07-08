export type Organization = {
  id: number;
  name: string;
  status: 'active' | 'inactive';
};

export type User = {
  id: number;
  name: string;
  email: string;
  avatar: string;
  role: 'admin' | 'user';
  joined_at: string;
};

export type Court = {
  id: number;
  name: string;
  type: string;
  status: 'available' | 'booked' | 'maintenance';
};

export type Booking = {
  id: number;
  booking_date: string;
  status: 'confirmed' | 'cancelled';
  users: {
    name: string;
  } | null;
  courts: {
    name: string;
  } | null;
};

export type Event = {
  id: number;
  name: string;
  date: string;
  start_time: string;
  end_time: string;
  status: 'upcoming' | 'completed' | 'cancelled';
};
