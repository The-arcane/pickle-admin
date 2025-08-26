-- Helper function to get the user_type of the currently authenticated user.
CREATE OR REPLACE FUNCTION get_my_user_type()
RETURNS INT AS $$
DECLARE
  user_type_val INT;
BEGIN
  SELECT user_type INTO user_type_val FROM public.user WHERE user_uuid = auth.uid();
  RETURN user_type_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS and apply read-access policies to all tables.

-- Table: alembic_version
ALTER TABLE public.alembic_version ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to specific user types on alembic_version" ON public.alembic_version FOR SELECT USING (get_my_user_type() IN (1, 2, 3));

-- Table: amenities
ALTER TABLE public.amenities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to specific user types on amenities" ON public.amenities FOR SELECT USING (get_my_user_type() IN (1, 2, 3));

-- Table: approvals
ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to specific user types on approvals" ON public.approvals FOR SELECT USING (get_my_user_type() IN (1, 2, 3));

-- Table: availability_blocks
ALTER TABLE public.availability_blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to specific user types on availability_blocks" ON public.availability_blocks FOR SELECT USING (get_my_user_type() IN (1, 2, 3));

-- Table: booking_logs
ALTER TABLE public.booking_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to specific user types on booking_logs" ON public.booking_logs FOR SELECT USING (get_my_user_type() IN (1, 2, 3));

-- Table: booking_status
ALTER TABLE public.booking_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to specific user types on booking_status" ON public.booking_status FOR SELECT USING (get_my_user_type() IN (1, 2, 3));

-- Table: bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to specific user types on bookings" ON public.bookings FOR SELECT USING (get_my_user_type() IN (1, 2, 3));

-- Table: channel_invitations
ALTER TABLE public.channel_invitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to specific user types on channel_invitations" ON public.channel_invitations FOR SELECT USING (get_my_user_type() IN (1, 2, 3));

-- Table: channel_members
ALTER TABLE public.channel_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to specific user types on channel_members" ON public.channel_members FOR SELECT USING (get_my_user_type() IN (1, 2, 3));

-- Table: chat_messages
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to specific user types on chat_messages" ON public.chat_messages FOR SELECT USING (get_my_user_type() IN (1, 2, 3));

-- Table: chat_preferences
ALTER TABLE public.chat_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to specific user types on chat_preferences" ON public.chat_preferences FOR SELECT USING (get_my_user_type() IN (1, 2, 3));

-- Table: chat_sessions
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to specific user types on chat_sessions" ON public.chat_sessions FOR SELECT USING (get_my_user_type() IN (1, 2, 3));

-- Table: coach_pricing
ALTER TABLE public.coach_pricing ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to specific user types on coach_pricing" ON public.coach_pricing FOR SELECT USING (get_my_user_type() IN (1, 2, 3));

-- Table: coach_sports
ALTER TABLE public.coach_sports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to specific user types on coach_sports" ON public.coach_sports FOR SELECT USING (get_my_user_type() IN (1, 2, 3));

-- Table: coaches
ALTER TABLE public.coaches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to specific user types on coaches" ON public.coaches FOR SELECT USING (get_my_user_type() IN (1, 2, 3));

-- Table: community_messages
ALTER TABLE public.community_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to specific user types on community_messages" ON public.community_messages FOR SELECT USING (get_my_user_type() IN (1, 2, 3));

-- Table: court_amenities
ALTER TABLE public.court_amenities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to specific user types on court_amenities" ON public.court_amenities FOR SELECT USING (get_my_user_type() IN (1, 2, 3));

-- Table: court_contacts
ALTER TABLE public.court_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to specific user types on court_contacts" ON public.court_contacts FOR SELECT USING (get_my_user_type() IN (1, 2, 3));

-- Table: court_gallery
ALTER TABLE public.court_gallery ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to specific user types on court_gallery" ON public.court_gallery FOR SELECT USING (get_my_user_type() IN (1, 2, 3));

-- Table: court_reviews
ALTER TABLE public.court_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to specific user types on court_reviews" ON public.court_reviews FOR SELECT USING (get_my_user_type() IN (1, 2, 3));

-- Table: court_rules
ALTER TABLE public.court_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to specific user types on court_rules" ON public.court_rules FOR SELECT USING (get_my_user_type() IN (1, 2, 3));

-- Table: court_status
ALTER TABLE public.court_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to specific user types on court_status" ON public.court_status FOR SELECT USING (get_my_user_type() IN (1, 2, 3));

-- Table: courts
ALTER TABLE public.courts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to specific user types on courts" ON public.courts FOR SELECT USING (get_my_user_type() IN (1, 2, 3));

-- Table: event_booking_status
ALTER TABLE public.event_booking_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to specific user types on event_booking_status" ON public.event_booking_status FOR SELECT USING (get_my_user_type() IN (1, 2, 3));

-- Table: event_bookings
ALTER TABLE public.event_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to specific user types on event_bookings" ON public.event_bookings FOR SELECT USING (get_my_user_type() IN (1, 2, 3));

-- Table: event_categories
ALTER TABLE public.event_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to specific user types on event_categories" ON public.event_categories FOR SELECT USING (get_my_user_type() IN (1, 2, 3));

-- Table: event_category_map
ALTER TABLE public.event_category_map ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to specific user types on event_category_map" ON public.event_category_map FOR SELECT USING (get_my_user_type() IN (1, 2, 3));

-- Table: event_gallery_images
ALTER TABLE public.event_gallery_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to specific user types on event_gallery_images" ON public.event_gallery_images FOR SELECT USING (get_my_user_type() IN (1, 2, 3));

-- Table: event_sub_events
ALTER TABLE public.event_sub_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to specific user types on event_sub_events" ON public.event_sub_events FOR SELECT USING (get_my_user_type() IN (1, 2, 3));

-- Table: event_tag_map
ALTER TABLE public.event_tag_map ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to specific user types on event_tag_map" ON public.event_tag_map FOR SELECT USING (get_my_user_type() IN (1, 2, 3));

-- Table: event_tags
ALTER TABLE public.event_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to specific user types on event_tags" ON public.event_tags FOR SELECT USING (get_my_user_type() IN (1, 2, 3));

-- Table: event_what_to_bring
ALTER TABLE public.event_what_to_bring ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to specific user types on event_what_to_bring" ON public.event_what_to_bring FOR SELECT USING (get_my_user_type() IN (1, 2, 3));

-- Table: events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to specific user types on events" ON public.events FOR SELECT USING (get_my_user_type() IN (1, 2, 3));

-- Table: events_status
ALTER TABLE public.events_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to specific user types on events_status" ON public.events_status FOR SELECT USING (get_my_user_type() IN (1, 2, 3));

-- Table: organisation_roles
ALTER TABLE public.organisation_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to specific user types on organisation_roles" ON public.organisation_roles FOR SELECT USING (get_my_user_type() IN (1, 2, 3));

-- Table: organisation_types
ALTER TABLE public.organisation_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to specific user types on organisation_types" ON public.organisation_types FOR SELECT USING (get_my_user_type() IN (1, 2, 3));

-- Table: organisations
ALTER TABLE public.organisations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to specific user types on organisations" ON public.organisations FOR SELECT USING (get_my_user_type() IN (1, 2, 3));

-- Table: organisations_website
ALTER TABLE public.organisations_website ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to specific user types on organisations_website" ON public.organisations_website FOR SELECT USING (get_my_user_type() IN (1, 2, 3));

-- Table: package_bookings
ALTER TABLE public.package_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to specific user types on package_bookings" ON public.package_bookings FOR SELECT USING (get_my_user_type() IN (1, 2, 3));

-- Table: packages
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to specific user types on packages" ON public.packages FOR SELECT USING (get_my_user_type() IN (1, 2, 3));

-- Table: permission_entity
ALTER TABLE public.permission_entity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to specific user types on permission_entity" ON public.permission_entity FOR SELECT USING (get_my_user_type() IN (1, 2, 3));

-- Table: post
ALTER TABLE public.post ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to specific user types on post" ON public.post FOR SELECT USING (get_my_user_type() IN (1, 2, 3));

-- Table: rate_limit
ALTER TABLE public.rate_limit ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to specific user types on rate_limit" ON public.rate_limit FOR SELECT USING (get_my_user_type() IN (1, 2, 3));

-- Table: realtime_channels
ALTER TABLE public.realtime_channels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to specific user types on realtime_channels" ON public.realtime_channels FOR SELECT USING (get_my_user_type() IN (1, 2, 3));

-- Table: recurring_unavailability
ALTER TABLE public.recurring_unavailability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to specific user types on recurring_unavailability" ON public.recurring_unavailability FOR SELECT USING (get_my_user_type() IN (1, 2, 3));

-- Table: refunds
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to specific user types on refunds" ON public.refunds FOR SELECT USING (get_my_user_type() IN (1, 2, 3));

-- Table: residence_status
ALTER TABLE public.residence_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to specific user types on residence_status" ON public.residence_status FOR SELECT USING (get_my_user_type() IN (1, 2, 3));

-- Table: residences
ALTER TABLE public.residences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to specific user types on residences" ON public.residences FOR SELECT USING (get_my_user_type() IN (1, 2, 3));

-- Table: shifts
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to specific user types on shifts" ON public.shifts FOR SELECT USING (get_my_user_type() IN (1, 2, 3));

-- Table: sports
ALTER TABLE public.sports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to specific user types on sports" ON public.sports FOR SELECT USING (get_my_user_type() IN (1, 2, 3));

-- Table: tier
ALTER TABLE public.tier ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to specific user types on tier" ON public.tier FOR SELECT USING (get_my_user_type() IN (1, 2, 3));

-- Table: timeslots
ALTER TABLE public.timeslots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to specific user types on timeslots" ON public.timeslots FOR SELECT USING (get_my_user_type() IN (1, 2, 3));

-- Table: token_blacklist
ALTER TABLE public.token_blacklist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to specific user types on token_blacklist" ON public.token_blacklist FOR SELECT USING (get_my_user_type() IN (1, 2, 3));

-- Table: transaction_reference_types
ALTER TABLE public.transaction_reference_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to specific user types on transaction_reference_types" ON public.transaction_reference_types FOR SELECT USING (get_my_user_type() IN (1, 2, 3));

-- Table: transaction_status
ALTER TABLE public.transaction_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to specific user types on transaction_status" ON public.transaction_status FOR SELECT USING (get_my_user_type() IN (1, 2, 3));

-- Table: transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to specific user types on transactions" ON public.transactions FOR SELECT USING (get_my_user_type() IN (1, 2, 3));

-- Table: user
ALTER TABLE public."user" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to specific user types on user" ON public."user" FOR SELECT USING (get_my_user_type() IN (1, 2, 3));

-- Table: user_employee_entity_permissions
ALTER TABLE public.user_employee_entity_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to specific user types on user_employee_entity_permissions" ON public.user_employee_entity_permissions FOR SELECT USING (get_my_user_type() IN (1, 2, 3));

-- Table: user_employee_permissions
ALTER TABLE public.user_employee_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to specific user types on user_employee_permissions" ON public.user_employee_permissions FOR SELECT USING (get_my_user_type() IN (1, 2, 3));

-- Table: user_organisations
ALTER TABLE public.user_organisations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to specific user types on user_organisations" ON public.user_organisations FOR SELECT USING (get_my_user_type() IN (1, 2, 3));

-- Table: user_profile
ALTER TABLE public.user_profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to specific user types on user_profile" ON public.user_profile FOR SELECT USING (get_my_user_type() IN (1, 2, 3));
