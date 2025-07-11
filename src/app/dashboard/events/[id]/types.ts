// This file defines the types used in the add/edit event page.

export type Organisation = {
    id: number;
    name: string;
};

export type User = {
    id: number;
    name: string;
}

export type EventCategory = {
    id: number;
    name: string;
};

export type EventTag = {
    id: number;
    name: string;
};

export type SubEvent = {
    id: number;
    event_id: number;
    title: string | null;
    start_time: string | null;
    end_time: string | null;
};

export type WhatToBringItem = {
    id: number;
    event_id: number;
    item: string;
};

export type EventGalleryImage = {
    id: number;
    image_url: string;
};

// This type now reflects the full table structure
export type Event = {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  type: string | null;
  access_type: 'public' | 'private' | 'invite-only' | null;
  organiser_user_id: number | null;
  organiser_org_id: number | null;
  start_time: string;
  end_time: string;
  timezone: string | null;
  location_name: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  is_family_friendly: boolean | null;
  is_outdoor: boolean | null;
  has_parking: boolean | null;
  is_accessible: boolean | null;
  pets_allowed: boolean | null;
  security_on_site: boolean | null;
  is_free: boolean;
  currency: string | null;
  amount: number | null;
  pricing_notes: string | null;
  cover_image: string | null;
  video_url: string | null;
  requires_login: boolean | null;
  requires_invitation_code: boolean | null;
  is_discoverable: boolean | null;
  is_public: boolean | null;
  max_bookings_per_user: number | null;
  max_total_capacity: number | null;
  
  // Nested relations
  event_sub_events: SubEvent[];
  event_what_to_bring: WhatToBringItem[];
  event_gallery_images: EventGalleryImage[];
};
