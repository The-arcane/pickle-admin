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

export type Amenity = {
    amenity: string;
};

// Based on the provided schema for the 'courts' table and its relations
export type Court = {
  id: number;
  name: string;
  address: string;
  lat: number | null;
  lng: number | null;
  organisation_id: number;
  sport_id: number;
  description: string | null;
  max_players: number | null;
  audience_capacity: number | null;
  is_equipment_available: boolean | null;
  surface: string | null;
  has_floodlights: boolean | null;
  
  // Nested relations
  organisations: Organisation | null;
  sports: Sport | null;
  court_amenities: Amenity[];
};
