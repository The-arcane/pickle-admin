-- This file drops all admin-related RLS policies to provide a clean slate.

-- Drop Policies for tables with direct organisation_id
DROP POLICY IF EXISTS "Admin access on approvals" ON public.approvals;
DROP POLICY IF EXISTS "Admin access on packages" ON public.packages;
DROP POLICY IF EXISTS "Admin access on package_bookings" ON public.package_bookings;
DROP POLICY IF EXISTS "Admin access on coaches" ON public.coaches;
DROP POLICY IF EXISTS "Admin access on user_organisations" ON public.user_organisations;
DROP POLICY IF EXISTS "Admin access on residences" ON public.residences;
DROP POLICY IF EXISTS "Admin access on courts" ON public.courts;
DROP POLICY IF EXISTS "Admin access on realtime_channels" ON public.realtime_channels;

-- Drop Policies for tables with indirect organisation_id via 'courts'
DROP POLICY IF EXISTS "Admin access on timeslots" ON public.timeslots;
DROP POLICY IF EXISTS "Admin access on availability_blocks" ON public.availability_blocks;
DROP POLICY IF EXISTS "Admin access on recurring_unavailability" ON public.recurring_unavailability;
DROP POLICY IF EXISTS "Admin access on court_rules" ON public.court_rules;
DROP POLICY IF EXISTS "Admin access on court_contacts" ON public.court_contacts;
DROP POLICY IF EXISTS "Admin access on court_amenities" ON public.court_amenities;
DROP POLICY IF EXISTS "Admin access on court_gallery" ON public.court_gallery;
DROP POLICY IF EXISTS "Admin access on court_reviews" ON public.court_reviews;

-- Drop Policies for tables with indirect organisation_id via 'events'
DROP POLICY IF EXISTS "Admin access on events" ON public.events;
DROP POLICY IF EXISTS "Admin access on event_bookings" ON public.event_bookings;
DROP POLICY IF EXISTS "Admin access on event_sub_events" ON public.event_sub_events;
DROP POLICY IF EXISTS "Admin access on event_what_to_bring" ON public.event_what_to_bring;
DROP POLICY IF EXISTS "Admin access on event_gallery_images" ON public.event_gallery_images;
DROP POLICY IF EXISTS "Admin access on event_category_map" ON public.event_category_map;
DROP POLICY IF EXISTS "Admin access on event_tag_map" ON public.event_tag_map;

-- Drop Policies for tables with indirect organisation_id via 'coaches'
DROP POLICY IF EXISTS "Admin access on coach_sports" ON public.coach_sports;
DROP POLICY IF EXISTS "Admin access on coach_pricing" ON public.coach_pricing;

-- Drop Policies for tables linked to a user within the admin's organisation
DROP POLICY IF EXISTS "Admin access on user_employee_permissions" ON public.user_employee_permissions;
DROP POLICY IF EXISTS "Admin access on user_employee_entity_permissions" ON public.user_employee_entity_permissions;
DROP POLICY IF EXISTS "Admin access on channel_invitations" ON public.channel_invitations;

-- Drop Policies for read-only tables (no direct org link, but accessible to admins)
DROP POLICY IF EXISTS "Admin can view booking_status" ON public.booking_status;
DROP POLICY IF EXISTS "Admin can view event_booking_status" ON public.event_booking_status;
DROP POLICY IF EXISTS "Admin can view sports" ON public.sports;
DROP POLICY IF EXISTS "Admin can view organisation_roles" ON public.organisation_roles;
DROP POLICY IF EXISTS "Admin can view permission_entity" ON public.permission_entity;
DROP POLICY IF EXISTS "Admin can view users in their org" ON public."user";
