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

// Based on the provided schema for the 'courts' table
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
  
  // Nested relations
  organisations: Organisation | null;
  sports: Sport | null;
};
