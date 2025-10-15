// This file defines the types used in the add/edit court page.

export type Organisation = {
    id: number;
    name: string;
    address: string | null;
};

export type Sport = {
    id: number;
    name: string;
};

export type CourtRule = {
    id: number;
    court_id: number;
    rule: string;
};

export type CourtContact = {
    id: number;
    court_id: number;
    phone: string | null;
    email: string | null;
    closed_days: string[] | null;
};

export type AvailabilityBlock = {
    id: number;
    court_id: number;
    date: string | null;
    start_time: string | null;
    end_time: string | null;
    reason: string | null;
};

export type RecurringUnavailability = {
    id: number;
    court_id: number;
    day_of_week: number;
    start_time: string;
    end_time: string;
    reason: string | null;
    active: boolean;
};

export type CourtGalleryImage = {
    id: number;
    image_url: string;
};


// Based on the provided schema for the 'courts' table and its relations
export type Court = {
  id: number;
  name: string;
  address: string;
  lat: number;
  lng: number;
  organisation_id: number;
  sport_id: number;
  description: string | null;
  rating: number | null;
  reviews_count: number | null;
  distance_label: string | null;
  cover_image: string | null;
  max_players: number | null;
  feature: string | null;
  price: number | null;
  discount: number | null;
  image: string | null;
  badge_type: string | null;
  audience_capacity: number | null;
  is_equipment_available: boolean | null;
  surface: string | null;
  has_floodlights: boolean | null;
  c_start_time: string | null;
  c_end_time: string | null;
  is_public: boolean | null;
  booking_window: number;
  one_booking_per_user_per_day: boolean;
  is_booking_rolling: boolean;
  
  // Nested relations
  organisations: Organisation | null;
  sports: Sport | null;
  court_rules: CourtRule[];
  court_contacts: CourtContact[];
  availability_blocks: AvailabilityBlock[];
  recurring_unavailability: RecurringUnavailability[];
  court_gallery: CourtGalleryImage[];
};
