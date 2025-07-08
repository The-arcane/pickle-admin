export type Organization = {
  id: number;
  name: string;
  status: 'active' | 'inactive';
};

export type User = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  profile_image_url: string | null;
  created_at: string;
};

export type Court = {
  id: number;
  name: string;
  surface: string | null;
  // Other court fields can be added here as needed
};

export type Booking = {
  id: number;
  status: number; // e.g., 0 for Cancelled, 1 for Confirmed
  user_id: number;
  court_id: number;
  timeslot_id: number;
  
  // Example of how related data might look after a join
  user?: { name: string } | null;
  courts?: { name: string } | null;
  booking_status?: { label: string } | null;
  timeslots?: { date: string | null } | null;
};

export type Event = {
  id: number;
  title: string;
  start_time: string;
  end_time: string;
  location_name: string | null;
  is_free: boolean;
  amount: number | null;
  // Other event fields can be added here
};
