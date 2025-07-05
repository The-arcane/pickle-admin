// This file defines the types used in the add/edit event page.

export type Organisation = {
    id: number;
    name: string;
};

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
    type: string | null;
    description: string | null;
    start_time: string | null;
    end_time: string | null;
    location: string | null;
};

export type GalleryImage = {
    id: number;
    event_id: number;
    image_url: string;
};

export type WhatToBringItem = {
    id: number;
    event_id: number;
    item: string;
};

export type Event = {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  type: string | null;
  access_type: string | null;
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
  max_total_capacity: number | null;
  
  // Nested relations
  event_sub_events: SubEvent[];
  event_gallery_images: GalleryImage[];
  event_what_to_bring: WhatToBringItem[];
  // Mapped relations - simplified for form
  event_categories: { category_id: number }[];
  event_tags: { tag_id: number }[];
};
