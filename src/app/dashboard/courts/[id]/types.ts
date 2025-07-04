// This file defines the types used in the add/edit court page.

export type Court = {
  id: number;
  name: string;
  address: string | null;
  organisation_id: number;
  sport_id: number;
  lat: number | null;
  lng: number | null;
  // Mocked fields from design
  venue_name: string;
  venue_address: string;
  sports_type: string;
  max_players: number;
  court_type: string[];
  audience_capacity: number;
  tags: string[];
  equipment_rental: boolean;
  description: string;
  labels: string[];
  facilities: string[];
};

export type Organisation = {
    id: number;
    name: string;
    address: string | null;
};

export type Sport = {
    id: number;
    name: string;
};
